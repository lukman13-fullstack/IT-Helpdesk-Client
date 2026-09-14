import Lottie from "lottie-react";
import NotFoundCat from "../../assets/lottie/PinkCat404.json";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold color-   ">Page Not Found</h1>
      <p>Halaman yang Anda cari tidak ditemukan</p>
      <p>Silahkan kembali ke halaman utama</p>
      <Lottie animationData={NotFoundCat} style={{ width: 400, height: 400 }} />
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
