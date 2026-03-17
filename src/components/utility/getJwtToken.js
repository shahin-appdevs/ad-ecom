const getJwtToken = () => {
    return localStorage.getItem("jwtToken");
};

export default getJwtToken;
