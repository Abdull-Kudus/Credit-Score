"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import {
  LandmarkIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  CheckIcon,
  ShieldCheckIcon,
  UserIcon,
  PhoneIcon,
  BriefcaseIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"

const GlobeDemo = dynamic(() => import("@/components/globe-demo"), {
  ssr: false,
})

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    occupation_type: "",
    password: "",
    confirm_password: "",
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrorMsg("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      setErrorMsg(error.message)
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    setErrorMsg("")

    if (form.password !== form.confirm_password) {
      setErrorMsg("Passwords do not match")
      return
    }

    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone_number: form.phone_number,
          occupation_type: form.occupation_type,
        },
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setIsSuccess(true)
    setTimeout(() => {
      router.push("/dashboard")
      router.refresh()
    }, 1000)
  }

  return (
    <div className="flex min-h-svh">
      {/* Left panel - Globe */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-950 lg:flex">
        {/* Logo */}
        <Link href="/" className="relative z-20 flex items-center gap-2.5 p-8">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white text-black">
            <LandmarkIcon className="size-4" />
          </div>
          <span className="text-sm font-semibold text-white">
            Credit Score Passport
          </span>
        </Link>

        {/* Globe */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <GlobeDemo />
        </div>

        {/* Quote overlay — pinned to bottom */}
        <div className="relative z-20 mt-auto p-8">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <blockquote className="text-sm leading-relaxed text-white/80">
              &ldquo;Compound interest is the eighth wonder of the world. He who
              understands it, earns it; he who doesn&apos;t, pays it.&rdquo;
            </blockquote>
            <p className="mt-3 text-xs text-white/50">
              &mdash; Albert Einstein
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo (mobile) */}
          <motion.div
            className="mb-8 flex flex-col items-center lg:hidden"
            variants={itemVariants}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LandmarkIcon className="size-5" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div className="text-center" variants={itemVariants}>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Build your Credit Passport today
            </p>
          </motion.div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div variants={itemVariants} className="mt-8 p-3 text-sm text-destructive-foreground bg-destructive rounded-md text-center">
              {errorMsg}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <motion.div variants={itemVariants}>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <UserIcon className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <MailIcon className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium">
                Phone Number
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <PhoneIcon className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="0244123456"
                  value={form.phone_number}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="occupation_type" className="mb-1.5 block text-sm font-medium">
                Occupation Type
              </label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <BriefcaseIcon className="size-4 text-muted-foreground" />
                </InputGroupAddon>
                <select
                  id="occupation_type"
                  name="occupation_type"
                  value={form.occupation_type}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="" disabled>Select your occupation</option>
                  <option value="trader">Trader / Market Vendor</option>
                  <option value="driver">Driver</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="food_vendor">Food Vendor</option>
                  <option value="student">Student with Side Income</option>
                  <option value="gig_worker">Gig Worker</option>
                  <option value="other">Other</option>
                </select>
              </InputGroup>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                  Password
                </label>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <LockIcon className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="confirm_password" className="mb-1.5 block text-sm font-medium">
                  Confirm
                </label>
                <InputGroup>
                  <InputGroupInput
                    id="confirm_password"
                    name="confirm_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowPassword(!showPassword)
                      }}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="size-3.5 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="size-3.5 text-muted-foreground" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </motion.div>
            </div>

            <motion.div
              className="flex items-start gap-2.5 pt-2"
              variants={itemVariants}
            >
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link
                  href="#"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading || isSuccess || !agreed}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin mr-2" />
                    <span>Creating account...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckIcon className="size-4 mr-2" />
                    <span>Account created!</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="mt-6 flex items-center justify-between">
            <span className="w-1/4 border-b border-muted"></span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
            <span className="w-1/4 border-b border-muted"></span>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full bg-background"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSuccess}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="mt-6 text-center text-sm text-muted-foreground"
            variants={itemVariants}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </motion.p>

          {/* Secured badge */}
          <motion.div
            className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60"
            variants={itemVariants}
          >
            <ShieldCheckIcon className="size-3.5" />
            <span>Secure Authentication</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
