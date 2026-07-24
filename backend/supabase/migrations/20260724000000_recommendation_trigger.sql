-- Function to update recommendation progress based on new transactions
CREATE OR REPLACE FUNCTION public.update_recommendation_progress()
RETURNS TRIGGER AS $$
DECLARE
  rec_factor VARCHAR(50);
BEGIN
  -- Determine which factor this transaction affects
  IF NEW.transaction_type = 'income' OR NEW.transaction_type = 'CASH_IN' OR (NEW.transaction_type = 'TRANSFER' AND NEW.balance_after > NEW.balance_before) THEN
    rec_factor := 'income';
  ELSIF NEW.transaction_type = 'savings' OR (NEW.reference IS NOT NULL AND NEW.reference ILIKE '%savings%') THEN
    rec_factor := 'savings';
  ELSIF NEW.transaction_type = 'expense' OR NEW.transaction_type = 'bill_payment' OR NEW.transaction_type = 'PAYMENT' OR NEW.transaction_type = 'DEBIT' THEN
    rec_factor := 'payments';
  ELSE
    rec_factor := NULL;
  END IF;

  -- If a specific factor is matched, increment its progress
  IF rec_factor IS NOT NULL THEN
    UPDATE public.recommendations
    SET 
      current_progress = current_progress + 1,
      is_completed = CASE WHEN (current_progress + 1) >= target_value THEN TRUE ELSE FALSE END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND factor = rec_factor 
      AND is_completed = FALSE;
  END IF;

  -- Always increment the 'frequency' recommendation if it exists
  UPDATE public.recommendations
  SET 
    current_progress = current_progress + 1,
    is_completed = CASE WHEN (current_progress + 1) >= target_value THEN TRUE ELSE FALSE END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id 
    AND factor = 'frequency' 
    AND is_completed = FALSE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new transaction is inserted
CREATE TRIGGER on_transaction_inserted
  AFTER INSERT ON public.momo_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_recommendation_progress();
