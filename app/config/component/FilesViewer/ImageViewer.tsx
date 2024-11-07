import { Image } from "@chakra-ui/react"

const ImageViewer = ({url} : any) => {
  return (
    <Image src={url} />
  )
}

export default ImageViewer