import React from 'react'
import { Typography } from '@material-tailwind/react'

const StickyFooter = () => {
  return (
    <div>
      <footer>
      <hr className="my-8 border-blue-gray-50" />
      <Typography className="text-center text-customtext font-normal pb-9">
        &copy; 2023 Copyrights Not Reserved
      </Typography>
    </footer>
    </div>
  )
}

export default StickyFooter
