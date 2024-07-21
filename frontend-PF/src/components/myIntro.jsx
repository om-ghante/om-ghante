import React from 'react';
import { Typography, Button } from '@material-tailwind/react';
import introImg from '../assets/img1.jpg';

const MyIntro = () => {

    const toNavigateLinkedin = () => {
        window.open('https://www.linkedin.com/in/om-ghante', '_blank');
    };

    return (
        <>
        <div className="container mx-auto flex flex-col p-6 m-4 rounded-lg bg-custombg text-customtext h-auto md:h-[600px] pt-8">
            {/* FIRST LINE DIV */}
            <div className="flex flex-col w-full mb-6 md:mb-9">
                <Typography 
                    variant="h1" 
                    className="text-left text-4xl sm:text-6xl lg:text-8xl font-bold mb-5"
                >
                    OM GHANTE
                </Typography>
                <Typography 
                    variant="h4" 
                    className="text-left text-lg md:text-xl mb-4"
                >
                    Software Developer
                </Typography>
            </div>

            {/* SECOND LINE DIV */}
            <div className="flex flex-col md:flex-row items-center md:items-start w-full h-auto md:h-[500px] lg:h-[600px]">
                {/* LEFT DIV */}
                <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                    <img 
                        src={introImg} 
                        alt="Intro" 
                        className="w-full h-auto rounded-lg shadow-lg" 
                    />
                </div>

                {/* RIGHT DIV */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start md:p-6">
                    <Typography 
                        variant="body1" 
                        className="text-center lg:text-left text-base sm:text-lg lg:text-xl"
                    >
                        Crafting Tomorrow’s Technologies Today Empowering Innovation with Expertise and Passion to Shape the Future of Software and Design.
                    </Typography>
                    <Button 
                        onClick={toNavigateLinkedin} 
                        color="white"
                        variant='outlined' 
                        className="w-full md:w-auto mt-6 text-customtext "
                    >
                        Work With Me
                    </Button>
                </div>
            </div>
        </div>
        <div className="container mx-auto flex flex-col items-center p-6 m-4 rounded-lg bg-custombg text-customtext mt-8 mb-8">
           <div className="flex flex-col w-full mb-6 md:mb-9 items-center text-center mt-8 mb-8 pt-8 pb-9">
              <Typography variant="h1" className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5"> My Code Philosophy</Typography>
              <Typography variant="paragraph" className="text-lg md:text-xl mb-4">
                 My Code Philosophy revolves around the principle that great software is both functional and elegant. I believe in writing clean, maintainable code that not only meets the immediate needs but also anticipates future requirements and scalability. My approach emphasizes clarity, simplicity, and efficiency, ensuring that each line of code contributes to a well-structured and robust solution. By embracing continuous learning and staying updated with the latest industry practices, I strive to create solutions that are not only innovative but also practical and user-centric. To me, coding is not just about solving problems it's about crafting experiences that drive progress and inspire change.
              </Typography>
            </div>
        </div>
        </>
    );
};

export default MyIntro;
