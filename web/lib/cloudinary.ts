import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface UploadResult {
  public_id: string
  secure_url: string
  thumbnail_url: string
}

export async function uploadPhoto(
  base64Data: string,
  folder: string
): Promise<UploadResult> {
  // Ensure the data URI prefix is present
  const dataUri = base64Data.startsWith("data:")
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  })

  // Generate thumbnail URL via Cloudinary transformation
  const thumbnail_url = cloudinary.url(result.public_id, {
    width: 400,
    height: 400,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto",
  })

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    thumbnail_url,
  }
}

export async function deletePhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
