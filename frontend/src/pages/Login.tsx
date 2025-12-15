import { TestCredentialsDialog } from "@/components/custom/TestCredentials";
import { Input } from "@/components/ui/input";
import { useDimension } from "@/hooks/useDimension";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as yup from "yup";
import Button from "../components/custom/Button";
import CustomLink from "../components/custom/CustomLink";
import Spinner from "../partials/Spinner";
import { api } from "../store/api";
import { setAuth } from "../store/reducers/AuthSlice";
import { axios } from "../utils/axios";

interface LoginFormData {
  username: string;
  password: string;
}

const schema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(12, "Username must not exceed 12 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores !"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(16, "Password must not exceed 16 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { width } = useDimension();

  // State for loading spinner
  const [loading, setLoading] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  // Handle error messages for invalid inputs
  useEffect(() => {
    if (errors.username) {
      toast.error(errors.username.message);
    } else if (errors.password) {
      toast.error(errors.password.message);
    }
  }, [errors]);

  const login: SubmitHandler<LoginFormData> = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post<{ message: string }>("/auth/login", data);
      reset();
      dispatch(setAuth(true));
      // Invalidate the Auth, User and Chats tags to refetch data after login
      navigate("/");
      dispatch(api.util.invalidateTags(["Auth", "User", "Chats"]));
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to Log In !");
      console.error("Failed to Login:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validation function to check if the form is valid before submitting
  // This is to prevent the form from submitting if there are validation errors
  const validation = async (data: LoginFormData) => {
    const isValid = await trigger();
    // if form is not valid, do not submit the form
    if (!isValid) return;
    // if form is valid, call the login function
    login(data);
  };

  const fillCredentials = (username: string, password: string) => {
    setValue("username", username);
    setValue("password", password);
    toast.success("Credentials filled successfully !");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left side */}
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7),rgba(0,0,0,0.9)), url(/auth.jpeg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="hidden h-full w-full flex-col justify-between gap-4 bg-neutral-800/30 px-10 py-20 md:flex lg:px-20 xl:px-40"
      >
        <div className="flex w-fit items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="size-10" />
          <h1 className="text-3xl font-semibold">Echo.</h1>
        </div>
        <div>
          <h1 className="text-lg text-zinc-500">
            "Welcome back! Ready to dive into your conversations? Connect with friends, share
            moments, and enjoy seamless communication all in one place."
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div
        style={
          width <= 768
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,1), rgba(0,0,0,0.8)), url(/auth.jpeg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {}
        }
        className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-20 text-center lg:px-40"
      >
        <CustomLink absolute={true} side="right" route="signup">
          Sign Up Instead
        </CustomLink>
        <div>
          <h1 className="mb-1 text-2xl font-bold">Log In to your account</h1>
          <h2 className="text-lg text-zinc-500">Enter your username and password to Log In</h2>
        </div>

        <form onSubmit={handleSubmit(validation)} className="flex w-full flex-col gap-3">
          <Input
            register={register("username")}
            type="text"
            placeholder="Username"
            className="h-10"
          />
          <Input
            register={register("password")}
            type="password"
            placeholder="Password"
            className="h-10"
          />
          <Button type="submit" width="w-full">
            {!loading ? "Log In" : <Spinner />}
          </Button>

          <TestCredentialsDialog fillCredentials={fillCredentials} />
        </form>
      </div>
    </div>
  );
};

export default Login;
