let messages=(()=>{
    function getAllUsers(){
        return requester.get('user','','Kinvey');
    }

    function getAllmessages(){
        return requester.get('appdata','messages?query={}&sort={"_kmd.ect": -1}','Kinvey');
    }

    function getMyMessages(username) {  
        return requester.get('appdata',`messages?query={"recipient_username":"${username}"}`,'kinvey');
    }

    function getArchiveMessages(username) {  
        return requester.get('appdata',`messages?query={"sender_username":"${username}"}`,'kinvey');
    }

    function createMessage(sender_username,sender_name,recipient_username,text) { 
        let data = {sender_username,sender_name,recipient_username,text};
        return requester.post('appdata','messages',data,'kinvey');
     }

    function deleteMessage(messageId) { 
        return requester.remove('appdata',`messages/${messageId}`,'kinvey');
     }

    
    return{
        getAllUsers,
        getAllmessages,
        getMyMessages,
        getArchiveMessages,
        createMessage,
        deleteMessage
    };
})();