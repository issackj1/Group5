let ChatRoom = require('./models/chatroom.model');

module.exports = {

    submit: function (state) {
        const {name, email, password, password2} = state;
        let message = {};
        let count = 0;
        // check fields
        if (!name || !email || !password || !password2) {

            message['fill'] = 'Please fill in all fields';
            console.log("Please fill in all fields");
            count++;
        }

        // check if email contains an @ symbol
        if (!email.match('@')) {
            message['atsymbol'] = 'Invalid email address';
            console.log("Invalid email address");
            count++;
        }


        // check passwords match
        if (password !== password2) {
            message['match'] = 'Passwords do not match';
            console.log("Passwords do not match");
            count++;
        }

        // check password length
        if (password.length < 6) {
            message['passlength'] = 'Password should be at least 6 characters';
            console.log("Password should be at least 6 characters");
            count++;
        }

        if (count > 0) {
            return false;
        }

        //searching database to see if the email is available
        User.findOne({email: email})
            .then(email => {
                if (email) {
                    message['useralready'] = "email already in use";
                    console.log("email already in use");
                    return false;
                }
            });
        //searching database to see if the name is available
        User.findOne({name: name})
            .then(user => {
                if (user) {
                    message['already'] = 'user name already in use';
                    console.log("user name already in use");
                    //User exists
                    return false;
                } else {
                    const newUser = new User({name, email, password});

                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        {
                            //set apassword to hash
                            newUser.password = hash;
                            //save user
                            newUser.save()
                                .then(user => {
                                    //req.flash('success_msg' , 'You are now registered and can login');
                                    message['success'] = 'success';
                                    console.log("ayee");
                                    return true;
                                })
                                .catch(err => console.log(err));
                        }
                    }))
                }

            });
    },

    createRoom: function (state , userid) {
        console.log('got here')
        console.log(state);
        let chatroom = new ChatRoom(state);
        chatroom['RoomHostId']=userid
        //console.log(state);
        chatroom.save()
            .then(chatroom => {
                return true;
            })
    },

    updateChat: function(msg, roomid){
        ChatRoom.find({_id: roomid})
        .then(chatroom => {
            if(chatroom){
                console.log('chatroom log before message appended');
                chatroom.ChatLog.append(msg);
                return true;
            }else{
                return false;
            }
        })
    }

}
