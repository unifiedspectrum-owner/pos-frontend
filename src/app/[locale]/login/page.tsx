"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Stack,
  IconButton,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { LuEye, LuEyeOff } from "react-icons/lu"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - replace with actual auth logic
      if (data.email === "admin@example.com" && data.password === "password") {
        router.push("/admin")
      }
    } catch (err: unknown) {
      console.log("Error", err);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
    >
      <Box w="full" maxW="md" p={6}>
        <Card.Root spaceY={3}  p={5}>
          <Card.Header>
            <Stack spaceY={2} textAlign="center">
              <Heading size="lg">Sign In</Heading>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Enter your credentials to access your account
              </Text>
            </Stack>
          </Card.Header>
          
          <Card.Body>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spaceY={4}>
                
                <Field
                  label="Email"
                  invalid={!!errors.email}
                  errorText={errors.email?.message}
                >
                  <Input
                    p={'12px'}
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                </Field>
                
                <Field
                  label="Password"
                  invalid={!!errors.password}
                  errorText={errors.password?.message}
                >
                  <Flex position="relative" w={'100%'}>
                    <Input
                      p={'12px'}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      data-testid = 'password'
                      {...register("password")}
                    />
                    <IconButton
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <LuEyeOff /> : <LuEye />}
                    </IconButton>
                  </Flex>
                </Field>
                
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </Card.Body>
          
          <Card.Footer>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }} textAlign="center">
              Demo credentials: admin@example.com / password
            </Text>
          </Card.Footer>
        </Card.Root>
      </Box>
    </Flex>
  )
}