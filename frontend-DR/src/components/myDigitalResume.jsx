import React from 'react';
import avatar from '../assets/avatar.jpg';
import { 
  Avatar, 
  Typography,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  Card,
  CardBody,
  CardFooter,
  Button
} from '@material-tailwind/react';

export default function MyDigitalResume() {
  return (
    <div className="bg-[#0d1117] text-[#c9d1d9]  text-left">
      {/*Name Card*/}  
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4 justyfy-start">
          <Avatar src={avatar} alt='avatar'/>
          <div className="ml-4">
            <Typography className="text-2xl font-bold">Om Ghante</Typography>
            <Typography className="text-sm text-[#8b949e]">A Full Stack Developer</Typography>
          </div>
        </div>

        {/*Introduction*/}
        <section className='mb-8'>
          <Typography className="text-[#8b949e]">
            Aspiring Software Engineer with a solid Computer Engineering background and hands-on experience in web development and AI/ML. 
            Eager to apply my skills and passion for innovation as a Software Engineering Intern at Google.
          </Typography>
        </section>

        {/*Professional Summery*/}
        <section className="mb-8">
          <Typography className="text-xl font-semibold mb-2">Professional Summery</Typography>
          <Typography  className="text-[#8b949e] mt-2">
            As a dedicated Full Stack Developer with a solid foundation in Computer Engineering Diploma and a keen interest in Artificial Intelligence and Machine Learning, 
            I bring a unique blend of technical expertise and innovative thinking. My journey began with immersive internships and hands-on projects during my diploma years, 
            which laid the groundwork for my web development skills. Currently, I'm delving into the dynamic realms of AI and ML, continually expanding my knowledge and capabilities to stay at the forefront of technological advancements. 
            My commitment lies in crafting exceptional solutions and contributing to cutting-edge developments in the tech industry.
          </Typography>
        </section>

        {/*Education*/}
        <section className='mb-8'>
        <Typography className="text-xl font-semibold mb-2">Education</Typography>
          <div className="w-[32rem] mt-4 ml-5">
            <Timeline>
              <TimelineItem>
                <TimelineConnector />
                <TimelineHeader className="h-3">
                <TimelineIcon color="white" />
                  <Typography variant="h6" color="custom-gray" className="leading-none">
                   Sanjay Ghodawat University, Kop.
                  </Typography>
                </TimelineHeader>
                <TimelineBody className="pb-8">
                  <Typography className="text-sm text-[#8b949e]">BTech in Artificial Intelligence & Machine Learning Bachelor of Technology </Typography>
                  <Typography className="text-sm text-[#8b949e]">July 2023 - Present</Typography>
                </TimelineBody>
              </TimelineItem>
              <TimelineItem>
                <TimelineConnector />
                <TimelineHeader className="h-3">
                  <TimelineIcon color="white" />
                  <Typography variant="h6" color="custom-gray" className="leading-none">
                    D. Y. Patil College of Engineering & Technology (DYPCET), Kop.
                  </Typography>
                </TimelineHeader>
                <TimelineBody className="pb-8">
                  <Typography className="text-sm text-[#8b949e]">Diploma in Computer Engineering</Typography>
                  <Typography className="text-sm text-[#8b949e]">july 2021 - june 2023</Typography>
                </TimelineBody>
              </TimelineItem>
              <TimelineItem>
                <TimelineConnector />
                <TimelineHeader className="h-3">
                  <TimelineIcon color="white" />
                  <Typography variant="h6" color="custom-gray" className="leading-none">
                    Private High-School & Jr. College, Kop.
                  </Typography>
                </TimelineHeader>
                <TimelineBody className="pb-8">
                  <Typography className="text-sm text-[#8b949e]">12th [HSC]</Typography>
                  <Typography className="text-sm text-[#8b949e]">February 2021</Typography>
                </TimelineBody>
              </TimelineItem>
              <TimelineItem>
                <TimelineConnector />
                <TimelineHeader className="h-3">
                  <TimelineIcon color="white" />
                  <Typography variant="h6" color="custom-gray" className="leading-none">
                    Private High-School, Kop.
                  </Typography>
                </TimelineHeader>
                <TimelineBody className="pb-8">
                  <Typography className="text-sm text-[#8b949e]">10th [SSC] </Typography>
                  <Typography className="text-sm text-[#8b949e]">March 2019</Typography>
                </TimelineBody>
              </TimelineItem>
            </Timeline>
          </div>
        </section>



        {/*Experience*/}
        <section className="mb-8">
          <Typography className="text-xl font-semibold mb-2">Work Experience</Typography>
          <div className="mb-4">
            <Typography className="font-semibold">Anthaathi Private Limited - Kolhapur</Typography>
            <Typography className="text-sm text-[#8b949e]">Aug 2022 - Oct 2022</Typography>
            <Typography className="text-[#8b949e] mt-2">
              As a passionate Computer Engineering diploma graduate, I have honed my skills through a hands-on internship at Anthaathi Private Limited, where I specialized in web development. With a solid foundation in HTML, CSS, and JavaScript, 
              I have expanded my expertise to React.js and am explored React Native for mobile app development. My journey has also encompassed UI/UX design, 
              where I use Figma and Canva to create user-centric and visually captivating interfaces. Driven by a love for problem-solving and innovation, 
              I am enthusiastic about leveraging my technical and creative skills to tackle real-world challenges and make meaningful contributions in the tech industry.
            </Typography>
          </div>
        </section>

        {/*Projects*/}
        <section className="mb-8">
          <Typography className="text-xl font-semibold mb-2">Projects</Typography>
          <div className='mb-4'>
            <Card className="mt-6 w-full" color='gray'>
              <CardBody>
                <Typography variant="h5" className="mb-2 text-[#c9d1d9]">
                  Trip Genius using Gemini API
                </Typography>
                <Typography className='mb-1 text-[#c9d1d9]'>
                  Mongodb, Express.js, React+vite, Node.js | Material-Tailwind | Google Gemini API
                </Typography>
                <Typography className='text-[#c9d1d9]'>
                  Currently developing a Trip Genius Application using the MERN stack and Google Gemini API for the Gemini API Developer Competition. 
                  This project leverages advanced AI to provide personalized travel recommendations and itineraries, 
                  showcasing my skills in full-stack development and AI integration.
                </Typography>
              </CardBody>
              <CardFooter className="pt-0">
                <Button color='white' className='text-sm'>Read More</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mb-4">
            <Card className="mt-6 w-full" color='gray'>
              <CardBody>
                <Typography variant="h5" className="mb-2 text-[#c9d1d9]">
                  Genrative AI using Gemini API
                </Typography>
                <Typography className='mb-1 text-[#c9d1d9]'>
                  Mongodb, Express.js, React+vite, Node.js | Material-Tailwind | Google Gemini API
                </Typography>
                <Typography className='text-[#c9d1d9]'>
                  Developed a cutting-edge Generative AI application using the Google Gemini API in the MERN stack. 
                  This project highlights my expertise in machine learning and full-stack development, 
                  demonstrating the ability to integrate advanced AI capabilities into practical web applications.
                </Typography>
              </CardBody>
              <CardFooter className="pt-0">
                <Button color='white' className='text-sm'>Read More</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mb-4">
            <Card className="mt-6 w-full" color='gray'>
              <CardBody>
                <Typography variant="h5" className="mb-2 text-[#c9d1d9]">
                  Certify Builder
                </Typography>
                <Typography className='mb-1 text-[#c9d1d9]'>
                  Mongodb, Express.js, React+vite, Node.js | Material-Tailwind | Google drive API
                </Typography>
                <Typography className='text-[#c9d1d9]'>
                  Developed a MERN-based system for efficient certificate generation and management. Administrators enter the necessary details, 
                  which then automatically generate PDFs stored securely on Google Drive. 
                  Certificate links and student emails are maintained for easy access and distribution.
                </Typography>
              </CardBody>
              <CardFooter className="pt-0">
                <Button color='white' className='text-sm'>Read More</Button>
              </CardFooter>
            </Card>
          </div>
          <div className=''>
            <Card className="mt-6 w-full" color='gray'>
              <CardBody>
                <Typography variant="h5" className="mb-2 text-[#c9d1d9]">
                  Mentor Hub
                </Typography>
                <Typography className='mb-1 text-[#c9d1d9]'>
                  React+vite, JavaScript, Saas, Firebase
                </Typography>
                <Typography className='text-[#c9d1d9]'>
                  Secured the top 5th rank in a hackathon with MentorHub, a platform designed to connect mentors and mentees. Developed using Firebase, 
                  MentorHub facilitates seamless communication, scheduling, and resource sharing, showcasing my ability to create impactful, real-world applications.
                </Typography>
              </CardBody>
              <CardFooter className="pt-0">
                <Button color='white' className='text-sm'>Read More</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <hr className="border-t border-gray-300 my-4 " />

        {/*footer*/}
        <footer className="text-center text-[#8b949e] p-4">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">LeetCode</a>
            <a href="#" className="hover:text-white transition-colors">HackerRank</a>
            <a href="#" className="hover:text-white transition-colors">HackerEarth</a>
            <a href="#" className="hover:text-white transition-colors">GeeksForGeeks</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
