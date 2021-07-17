import axios from "axios"


var parser = {
    getBooks: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url}),
    getBookDetails: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url}),
    getBookUrl: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url}),
    getBookHaveBulletPointInDescription: (url) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookHaveBulletPointInDescription',{url:url})
}

export default parser