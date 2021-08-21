import axios from "axios"

const header = {
    'Access-Control-Allow-Methods':'POST',
    'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Origin':'*'
}

var parser = {
    getBooks: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url, headeer},{headers:header}),
    getBookDetails: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url},{headers:header}),
    getBookUrl: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url},{headers:header}),
    getBookHaveBulletPointInDescription: (url) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookHaveBulletPointInDescription',{url:url})
}

export default parser