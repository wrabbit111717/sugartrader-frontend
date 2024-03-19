import React, { useState, useContext } from "react";
import { Box, Button, Flex, LoadingOverlay, TextInput, Image, Text, Center } from "@mantine/core";
import HomeContext from "@state/index.context";
import { notifications } from "@mantine/notifications";
import { URL_AUTH_SIGNIN, URL_AUTH_SIGNUP, URL_AUTH_FORGOTPASS, URL_AUTH_RESETPASS } from "@util/urls";
import { useRouter } from "next/router";
import { useForm, isNotEmpty, isEmail, isInRange, hasLength, matches } from '@mantine/form';
import apiService from "@service/apiService";
import jwt from 'jsonwebtoken';
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Signin = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [type, setType] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();

    const {
        state: { user_data },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const signinForm = useForm({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            password: hasLength({ min: 8 }, 'Password must be at least 8 characters long'),
            email: isEmail('Invalid email'),
        },
    });

    const signupForm = useForm({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
            name: ''
        },
        validate: {
            password: hasLength({ min: 8 }, 'Password must be at least 8 characters long'),
            confirmPassword: (value) => {
                if (value !== signupForm.values.password) {
                  return 'Passwords do not match';
                }
                return undefined; // Return undefined for valid case
            },
            email: isEmail('Invalid email'),
        },
    });

    const forgotPasswordForm = useForm({
        initialValues: {
            email: ''
        },
        validate: {
            email: isEmail('Invalid email'),
        },
    });

    const resetPasswordForm = useForm({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validate: {
            password: hasLength({ min: 8 }, 'Password must be at least 8 characters long'),
            confirmPassword: (value) => {
                if (value !== resetPasswordForm.values.password) {
                  return 'Passwords do not match';
                }
                return undefined; // Return undefined for valid case
            },
        },
    });

    const signin = async () => {
        try {
            setIsLoading(true);
            // Make API request for user authentication
            const response = await apiService.post<{ token: string }>(URL_AUTH_SIGNIN, {
                email: signinForm.values.email,
                password: signinForm.values.password,
            });

            // Assuming the API returns a token upon successful authentication
            const token = response.token;
            const decodedToken = jwt.decode(token);

            if(token) {
                homeDispatch({
                    field: 'user_data',
                    value: { token },
                });
                localStorage.setItem('user', JSON.stringify(decodedToken));
                router.push("/offers", undefined, { shallow: true });
            } else {
                notifications.show({
                    title: 'Sign in',
                    message: 'Please insert correct credential',
                })                
            }
        } catch (error) {
            console.error('Signin error:', error);
            // Handle authentication error, show error notification, etc.
        } finally {
            setIsLoading(false);
        }
    }

    const signup = async () => {
        try {
            setIsLoading(true);

            if (signupForm.values.password !== signupForm.values.confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            // Make API request for user registration
            const response = await apiService.post<{ token: string }>(URL_AUTH_SIGNUP, {
                name: signupForm.values.name,
                email: signupForm.values.email,
                password: signupForm.values.password,
                confirmPassword: signupForm.values.confirmPassword
            });

            // Assuming the API returns a token upon successful registration
            const token = response.token;

            // Store the token in your application state or wherever you manage authentication
            if(token) {
                homeDispatch({
                    field: 'user_data',
                    value: { token },
                });
                localStorage.setItem('user', JSON.stringify(token));
                router.push("/offers", undefined, { shallow: true });
            } else {
                notifications.show({
                    title: 'Register',
                    message: 'Please insert correct credentials',
                })                
            }
        } catch (error) {
            console.error('Signup error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const forgotPassword = async () => {
        try {
            setIsLoading(true);
            // Make API request to send reset password email
            const response = await apiService.post<{ success: boolean }>(URL_AUTH_FORGOTPASS, {
                email: forgotPasswordForm.values.email
            });

            if (response.success) {
                notifications.show({
                    title: 'Email Sent',
                    message: 'Please check your email for password reset instructions.',
                    color: 'blue'
                });    
            } else {
                notifications.show({
                    title: 'Email Sent',
                    message: 'Please use valid Email.',
                    color: 'red'
                });    
                // Handle error, e.g., display an error message
            }

            // Show success notification
        } catch (error) {
            console.error('Forgot password error:', error);
            // Handle error
        } finally {
            setIsLoading(false);
        }
    }


    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Flex
            sx={(theme) => ({
                width: '100vw',
                height: '100vh',
            })}
            direction={'column'}
            justify={'center'}
            align={'center'}
        >

            <Flex
                direction={'column'}
                align={'center'}
                justify={"center"}
            >
                <Image src='/logo.svg' style={{ width: '100px' }} />
                {type === "signin" && (
                    <Box component="form" maw={400} mx="auto" onSubmit={signinForm.onSubmit(signin)}>
                    <Flex
                        direction={'column'}
                        gap={'20px'}
                    >
                        <TextInput label="Email" placeholder="Email" withAsterisk {...signinForm.getInputProps('email')} mt={30} w={350} />
                        <Flex align="center" justify={"center"}>
                            <TextInput
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                withAsterisk
                                {...signinForm.getInputProps('password')}
                                w={305} // Adjust width to accommodate the eye icon
                                h={85}
                            />
                            <Button
                                onClick={togglePasswordVisibility}
                                type="button"
                                style={{
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {
                                    showPassword ? 
                                    <FaEye size={20} color="#8EC2F2"/>    
                                    :
                                    <FaEyeSlash size={20} color="#8EC2F2"/>    
                                }

                            </Button>
                        </Flex>
                        <Flex justify={"flex-end"}>
                            <Text color="#0099ff" weight={600} style={{ cursor: 'pointer' }} onClick={() => setType('forgot')}>
                                Forgot Password
                            </Text>                            
                        </Flex>
                        <Button type="submit">
                            Sign In
                        </Button>
                        <Flex gap={10} justify={'center'}>
                            <Text>
                                Not a member
                            </Text>
                            <Text color="#0099ff" weight={600} style={{ cursor: 'pointer' }} onClick={() => setType('signup')}>
                                Sign Up
                            </Text>
                        </Flex>
                    </Flex>                        
                        
                    </Box>
                )}
                {type === "signup" && (
                    <Box component="form" maw={400} mx="auto" onSubmit={signupForm.onSubmit(signup)}>
                        <Flex
                            direction={'column'}
                            gap={'20px'}
                        >
                            <TextInput label="Name" placeholder="Name" withAsterisk {...signupForm.getInputProps('name')} mt={30} w={350} />
                            <TextInput label="Email" placeholder="Email" withAsterisk {...signupForm.getInputProps('email')} w={350} />
                            <TextInput
                                label="Password"
                                type="password"
                                placeholder="Password"
                                withAsterisk
                                {...signupForm.getInputProps('password')}
                                w={350}
                            />
                            <TextInput label="Confirm Password" type="password" placeholder="Confirm Password" withAsterisk {...signupForm.getInputProps('confirmPassword')} w={350} />
                            <Button type="submit">
                                Sign Up
                            </Button>
                            <Flex gap={10} justify={'center'}>
                                <Text>
                                    Are you member
                                </Text>
                                <Text color="#0099ff" weight={600} style={{ cursor: 'pointer' }} onClick={() => setType('signin')}>
                                    Sign In
                                </Text>
                            </Flex>
                        </Flex>
                    </Box>
                )}
                {type === "forgot" && (
                    <Box component="form" maw={400} mx="auto" onSubmit={forgotPasswordForm.onSubmit(forgotPassword)}>
                        <Flex
                            direction={'column'}
                            gap={'20px'}
                        >
                            <TextInput label="Email" placeholder="Email" withAsterisk {...forgotPasswordForm.getInputProps('email')} mt={30} w={350} />
                            <Button type="submit">
                                Reset Password
                            </Button>
                            <Flex gap={10} justify={'center'}>
                                <Text>
                                    Remembered your password?
                                </Text>
                                <Text color="#0099ff" weight={600} style={{ cursor: 'pointer' }} onClick={() => setType('signin')}>
                                    Sign In
                                </Text>
                            </Flex>
                        </Flex>
                    </Box>
                )}
            </Flex>
            <LoadingOverlay visible={isLoading} />
        </Flex>
    )
}

export default Signin;
