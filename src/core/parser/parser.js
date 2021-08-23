import axios from "axios"


var parser = {
    //each call has a retry if it fails => throw error
    getBooks: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url}).catch(()=>axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url})).catch(e =>{console.log(e); throw e}),
    getBookDetails: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url}).catch(()=>axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url})).catch(e =>{console.log(e); throw e}),
    getBookUrl: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url}).catch(()=>axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url})).catch(e =>{console.log(e); throw e}),
    getBookHaveBulletPointInDescription: (url) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookHaveBulletPointInDescription',{url:url}).catch(e =>{console.log(e); throw e}) //not used for now
}

export default parser