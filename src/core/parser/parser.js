import axios from "axios"


var parser = {
    getBooks: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBooks',{url:url, name:name}),
    getBookDetails: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookDetails',{url:url, name:name}),
    getBookUrl: (url, name) => axios.post(process.env.REACT_APP_SERVER_URL+'/getBookUrl',{url:url, name:name})
}

export default parser