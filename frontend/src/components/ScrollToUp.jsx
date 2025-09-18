import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToUp =()=>{
   const {pathname} =useLocation()

   useEffect(()=>{
    window.scrollTo({ top: 0, behavior: "smooth" });
   },[pathname])
 
    return ;
}

export default ScrollToUp;