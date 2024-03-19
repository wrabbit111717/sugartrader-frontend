import React, { useState, useContext, useEffect } from "react";
import { Box, Button, Flex, LoadingOverlay, TextInput, Image, Text, Center } from "@mantine/core";
import HomeContext from "@state/index.context";
import { notifications } from "@mantine/notifications";
import { URL_AUTH_RESETPASS } from "@util/urls";
import { useRouter } from "next/router";
import { useForm, isNotEmpty, isEmail, isInRange, hasLength, matches } from '@mantine/form';
import apiService from "@service/apiService";

const ResetPass = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const router = useRouter();

    const {
        state: { user_data },
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const [token, setToken] = useState(null);
    const [email, setEmail] = useState(null);

    useEffect(() => {
        // get the token and email sent in the url
        const queryParams : any = new URLSearchParams(window.location.search);
        setToken(queryParams.get("token"));
        setEmail(queryParams.get("email"));
        console.log(email, 'email')
    }, []);
    
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

    const resetPassword = async () => {
        try {
            setIsLoading(true);
        console.log(email, resetPasswordForm.values.password, 'email')

            const response = await apiService.post<{ success: boolean }>(URL_AUTH_RESETPASS, {
                email: email,
                password: resetPasswordForm.values.password
            });
            console.log(response, response.success, typeof(response.success), '___')
            
            if (response.success) {
                router.push("/auth/signin", undefined, { shallow: true });
                // Handle successful password reset, e.g., display a success message
            } else {
                console.error('Failed to reset password');
                // Handle error, e.g., display an error message
            }
            // Show success notification
            notifications.show({
                title: 'Password Reset',
                message: 'Your password has been successfully reset.',
                color: 'blue'
            });

            // Redirect user to signin page
        } catch (error) {
            console.error('Reset password error:', error);
            // Handle error
        } finally {
            setIsLoading(false);
        }
    }

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
                            
                <Box component="form" maw={400} mx="auto" onSubmit={resetPasswordForm.onSubmit(resetPassword)}>
                    <Flex
                        direction={'column'}
                        gap={'20px'}
                    >
                        <TextInput
                            label="Password"
                            type="password"
                            placeholder="Password"
                            withAsterisk
                            {...resetPasswordForm.getInputProps('password')}
                            w={350}
                        />
                        <TextInput
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            withAsterisk
                            {...resetPasswordForm.getInputProps('confirmPassword')}
                            w={350}
                        />
                        <Button type="submit">
                            Reset Password
                        </Button>
                    </Flex>
                </Box>
            </Flex>
            <LoadingOverlay visible={isLoading} />
        </Flex>
    )
}

export default ResetPass;
