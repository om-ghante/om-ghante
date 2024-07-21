import React from 'react';
import { Typography } from '@material-tailwind/react';

const PortfolioLanding = () => {
  return (
    <div className="container mx-auto flex flex-col lg:flex-row p-6 m-4 rounded-lg bg-custombg text-customtext h-auto sm:h-[600px] md:h-[700px] lg:h-[800px] pt-8">
    {/* Left side div */}
  <div className="flex-1 flex justify-center p-6 md:p-9 lg:pt-9">
    <div className="text-center md:text-left">
    <span className='flex flex-row items-center justify-center mb-5'>
      <Typography variant='h6' className="text-sm md:text-base mr-1 md:mr-1">Presented by</Typography>
      <Typography variant="h3" className="text-sm md:text-2xl lg:text-4xl ml-1 md:ml-2">Om Ghante</Typography>
    </span>
      <div className="text-6xl md:text-6xl lg:text-9xl font-bold">
        <div className="flex items-center justify-center md:justify-start">
          <span className="mr-4 md:mr-7">PORT</span>
          <div className="border-t border-customtext w-20 md:w-80"></div>
        </div>
        <div className="flex items-center justify-center md:justify-start mt-4">
          <div className="border-t border-customtext w-20 md:w-80"></div>
          <span className="ml-4 md:ml-7">FOLIO</span>
        </div>
      </div>
      <Typography variant='h3' className="text-sm md:text-xl mt-6 tracking-wider text-center">A Full Stack Developer</Typography>
    </div>
  </div>
</div>

  );
};

export default PortfolioLanding;
