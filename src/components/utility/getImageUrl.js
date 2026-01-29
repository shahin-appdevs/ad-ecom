const getImageUrl = (image, imagePath) => {
    const root = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    if (image === "http") return image;

    if (imagePath) {
        return `${root}/${imagePath}/${image}`;
    }
    return `${root}/${image}`;
};

export default getImageUrl;
