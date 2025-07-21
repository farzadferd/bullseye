
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, BarChart3, TrendingUp, Shield, Zap } from "lucide-react";
import { Target } from "lucide-react";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission (page reload)

    // --- Client-side validation for signup password mismatch ---
    // This check runs only if the user is in signup mode
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please re-enter."); // Inform user of mismatch
      return; // Stop the function execution if passwords don't match
    }

    // --- Determine API endpoint based on current mode (login or signup) ---
    const url = isLogin ? "http://localhost:8081/login" : "http://localhost:8081/signup";

    // --- Prepare the data payload to be sent to the backend ---
    // The structure of the payload changes based on whether it's a login or signup request.
    const payload = isLogin
      ? {
          email: formData.email,
          password: formData.password,
        }
      : {
          email: formData.email,
          first_name: formData.firstName, // Matches backend Pydantic schema (snake_case)
          last_name: formData.lastName,   // Matches backend Pydantic schema (snake_case)
          password: formData.password,
          confirmPassword: formData.confirmPassword, // Matches backend Pydantic schema (camelCase with alias)
        };

    try {
      // --- Send the HTTP POST request to the backend API ---
      const res = await fetch(url, {
        method: "POST", // Specify HTTP POST method
        headers: {
          "Content-Type": "application/json", // Indicate that the request body is JSON
        },
        body: JSON.stringify(payload), // Convert the JavaScript object to a JSON string
      });

      // --- Handle non-OK HTTP responses (e.g., 4xx or 5xx status codes) ---
      if (!res.ok) {
        const errorData = await res.json(); // Parse the error response body from the backend
        // Display an alert with the specific error detail from the backend, or a generic error message
        alert("Error: " + (errorData.detail || "An unknown error occurred during authentication."));
        return; // Stop function execution if there was an error
      }

      // --- Handle successful HTTP responses (2xx status codes) ---
      const data = await res.json(); // Parse the successful response body (e.g., user info)

      // Store authentication status and user details in local storage
      // This is a simple client-side way to persist login state.
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", `${data.first_name} ${data.last_name}`); // Store full name

      // Navigate to the dashboard upon successful login or signup
      navigate("/dashboard");
    } catch (error) {
      // --- Catch network-related errors (e.g., backend server is not running or unreachable) ---
      alert("Network error: Failed to connect to the server. Please try again later or ensure the backend is running: " + error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Technical Analysis",
      description: "Advanced charting and technical indicators for market analysis"
    },
    {
      icon: BarChart3,
      title: "Backtesting",
      description: "Test your strategies against historical data to validate performance"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Built-in risk controls and position sizing for safer trading"
    },
    {
      icon: Zap,
      title: "Automated Trading",
      description: "Execute trades automatically based on your defined strategies"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Bullseye</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional trading bot platform with advanced technical analysis, 
            backtesting, and automated trading capabilities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Login/Signup Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>{isLogin ? "Welcome Back" : "Get Started"}</CardTitle>
                  <CardDescription>
                    {isLogin ? "Sign in to access your trading dashboard" : "Create your account to start trading"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {!isLogin && (
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full">
                      {isLogin ? "Sign In & Access Dashboard" : "Create Account & Start Trading"}
                    </Button>
                  </form>

                  <Separator className="my-6" />

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <Button
                        type="button"
                        variant="link"
                        className="ml-1 p-0 h-auto"
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        {isLogin ? "Sign up" : "Sign in"}
                      </Button>
                    </p>
                  </div>

                  {isLogin && (
                    <div className="text-center mt-4">
                      <Button variant="link" className="text-sm text-blue-600">
                        Forgot your password?
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center lg:text-left">
              Why Choose Market Motion Tracer?
            </h2>
            <div className="grid gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;