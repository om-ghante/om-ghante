import React from 'react';
import { Typography } from '@material-tailwind/react';

const PortfolioLanding = () => {
  return (
    <div className="container mx-auto flex flex-row justify-between p-6 m-4 rounded-lg bg-custombg text-customtext" style={{height: '800px', paddingTop: '10%'}}>
      {/* Left side div */}
      <div className="flex-1 p-9">
        <div className="text-center">
          <span className='flex flex-col md:flex-row items-center justify-center mb-5'>
            <Typography variant='h6' className="text-base md:text-lg mr-2">Presented by </Typography>
            <Typography variant="h3" className="text-2xl md:text-4xl ml-2"> Om Ghante</Typography>
          </span>
          <div className="text-6xl md:text-9xl text-center font-bold">
            <div className="flex items-center mr-9 ml-0">
              <span className="mr-7 " style={{marginLeft: '20%'}}>PORT</span>
              <div className="border-t border-customtext" style={{width: '300px'}}></div>
            </div>
            <div className="flex items-center justify-start ">
              <div className="border-t border-customtext" style={{width: '300px', marginLeft: '20%'}}></div>
              <span className="ml-7" style={{marginRight: '20%'}}>FOLIO</span>
            </div>
          </div>
          <Typography variant='h3' className="text-lg mt-6 tracking-wider">A Full Stack Developer</Typography>
        </div>
      </div>
    </div>
  );
};

export default PortfolioLanding;
