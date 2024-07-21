import React from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
  Avatar,
  Card
} from "@material-tailwind/react";
import { Outlet } from "react-router-dom";
import PortfolioLanding from "./portfolioLanding";
import resume from '../assets/OmGhante.pdf'
import avatar from "../assets/avatar.jpg";
 
export function StickyNavbar() {
  const [openNav, setOpenNav] = React.useState(false);
 
  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false),
    );
  }, []);

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = resume;
    link.download = 'OmGhante.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visitDigitalResume = () => {
    window.open('https://om-ghante-digital-resume.vercel.app/', '_blank');
  };
 
  return (
    <div className="-m-6 max-h-[768px] w-[calc(100%+48px)]">
    <div className="sticky top-0 z-10 h-max max-w-full bg-custombg rounded-lg px-4 py-2 lg:px-8 lg:py-4">
        <div className="flex items-center justify-between text-customtext">
        <div className="flex items-center mb-4 justyfy-start md:mt-4 md:ml-4">
            <Avatar src={avatar} alt='avatar' variant="xl"/>
                <div className="ml-4">
                    <Typography className="text-2xl font-bold">Om Ghante</Typography>
                    <Typography className="text-sm ml-4">A Full Stack Developer</Typography>
                </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-x-1">
              <Button
                variant="outlined"
                size="sm"
                color="white"
                className="hidden lg:inline-block mr-2 text-customtext"
                onClick={downloadResume}
              >
                Download Resume
              </Button>
              <Button
                variant="outlined"
                size="sm"
                color="white"
                className="hidden lg:inline-block ml-2 text-customtext"
                onClick={visitDigitalResume}
              >
                Digital Resume
              </Button>
            </div>
            <IconButton
              variant="text"
              className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
              ripple={false}
              onClick={() => setOpenNav(!openNav)}
            >
              {openNav ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </IconButton>
          </div>
        </div>
        <MobileNav open={openNav}>
          <div className="flex items-center gap-x-1 mt-8 mb-8">
            <Button fullWidth variant="outlined" size="sm" color="white" className="mr-4 ml-4 text-customtext" onClick={downloadResume}>
                Download
            </Button>
            <Button fullWidth variant="outlined" size="sm" color="white" className="mr-4 ml-4 text-customtext" onClick={visitDigitalResume}>
                Digital Resumes
            </Button>
          </div>
        </MobileNav>
      </div>

      {/*Portfolio*/}
      <PortfolioLanding />

    </div>
  );
}