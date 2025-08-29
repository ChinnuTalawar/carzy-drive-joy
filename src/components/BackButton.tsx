import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  customPath?: string;
  className?: string;
}

const BackButton = ({ customPath, className = "" }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (customPath) {
      navigate(customPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className={`fixed top-4 left-4 z-50 gradient-card shadow-soft hover:shadow-medium transition-smooth ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default BackButton;