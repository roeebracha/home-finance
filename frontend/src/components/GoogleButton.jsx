import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/hooks/useTheme";

export default function GoogleButton({ onError }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { loginWithGoogle } = useAuth();
  const { resolved } = useTheme();

  if (!clientId) return null;

  return (
    <GoogleLogin
      onSuccess={(response) => {
        loginWithGoogle(response.credential).catch((error) => onError(error.message));
      }}
      onError={() => onError("ההתחברות עם Google נכשלה")}
      theme={resolved === "dark" ? "filled_black" : "outline"}
      shape="pill"
      size="large"
      width={280}
      text="signin_with"
      locale="he"
    />
  );
}
