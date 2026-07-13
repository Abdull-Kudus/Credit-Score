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
