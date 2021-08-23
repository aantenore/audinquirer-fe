import axios from "axios"


var parser = {
    getBooks: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url}).catch(e =>{console.log(e); throw e}),
    getBookDetails: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url}).catch(e =>{console.log(e); throw e}),
    getBookUrl: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url}).catch(e =>{console.log(e); throw e}),
    getBookHaveBulletPointInDescription: (url) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookHaveBulletPointInDescription',{url:url}).catch(e =>{console.log(e); throw e})
}

export default parser