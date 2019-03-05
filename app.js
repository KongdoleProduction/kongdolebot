var express = require('express');
var request = require('request');
var moment = require('moment-timezone');
var app = express();
app.use(express.json());

const PORT = process.env.PORT;
const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_ID = process.env.BOT_ID; // maybe useful in the future to prevent reply-to-itself
const ADMIN = process.env.BOT_ADMIN;
const ADMIN_CHANNEL = process.env.BOT_ADMIN_CHANNEL;

var users = [];
var dm_channels = [];

var server = app.listen(PORT, function() {
  console.log("Server started on port " + PORT);

  users = getUsers();
  dm_channels = getDMChannels();
});

app.post('/', function(req, res) {
    console.log('received: ', req.body);
    let payload = req.body;

    if (payload.type === "url_verification") {
      res.send(payload.challenge);
    } else if (payload.type === "event_callback") {
      res.sendStatus(200);
      if (payload.event.type === "app_mention") {
        console.log(payload.event.text);

        var text = "Knock knock";
        if (payload.event.text.includes('팩트')) {

          let facts = [
            "감자는 치킨을 좋아한다",
            "지니는 나라를 지킨다",
            "사장님은 잘생겼다",
          ];

          text = facts[Math.floor(Math.random() * facts.length)];
        }

        sendReply(text, payload.event.channel); 
      } else if (payload.event.type === 'message') {
        let text = payload.event.text;
        let channel_type = payload.event.channel_type;
        let channel = payload.event.channel;
        console.log("message(" + channel_type + "): ", text); 

        let user_id = payload.event.user;
        if (!user_id) { 
          /* this message is from a bot */

          return;
        } else if (channel === ADMIN_CHANNEL) {
          /* this message is from administrator */

          //let re_send_msg = /\s*\[\[([\s\S]+)\]\]\s*([\s\S]+)/; /* format for sending message */
          let re_cmd = /\s*\[([\s\S]+)\]([\s\S]+)/; /* format for common cmd */

          let arr_cmd = re_cmd.exec(text);
          if (!arr_cmd) {
            let msg = "사용법: \n" +
              "[전체] 메시지\n" +
              "[예약] 09:00 메시지";
            sendReply(msg, ADMIN_CHANNEL);
            return;
          }
          let cmd_name = arr_cmd[1];
          let cmd_contents = arr_cmd[2];

          if (cmd_name === '전체') {
            let re_msg = /\s*([\s\S]+)/; /* format for message */
            let arr_msg = re_msg.exec(cmd_contents);
            let target_msg = arr_msg[1];

            sendAll(target_msg);
            sendReply("전체 메시지 전송 완료!", ADMIN_CHANNEL);
          } else if (cmd_name == '예약') {
            let re_reserve = /\s*(\d\d)\:(\d\d)\s+([\s\S]+)/;
            let arr_reserve = re_reserve.exec(cmd_contents);
            let hour_str = arr_reserve[1];
            let min_str = arr_reserve[2];
            let target_msg = arr_reserve[3];

            /* calculate time left to trigger */
            let date_now = moment();
            let date_target = moment().tz("Asia/Seoul");
            date_target.hours(parseInt(hour_str));
            date_target.minutes(parseInt(min_str));
            date_target.seconds(0);
            if (date_target < date_now)
              date_target.add(1, 'days');
            let timeout = date_target - date_now; 

            /* reserve a broadcast message */
            setTimeout(() => {
              sendAll(target_msg);
            }, timeout);
            sendReply(`${hour_str}:${min_str}에 예약 완료!`, ADMIN_CHANNEL);
          }
          
         // } else { /* send to individual */
         //   let target_user = users.find(function(element) {
         //     return (element.profile.display_name === target_user_name)
         //       || (element.profile.real_name === target_user_name)
         //       || (element.name === target_user_name)
         //       || (element.real_name === target_user_name);
         //   });
         //   if (!target_user) {
         //     let msg = "존재하지 않는 사용자입니다.\n사용법: [[사용자 이름]] 메시지";
         //     sendReply(msg, ADMIN_CHANNEL);
         //   } else if (!target_msg || target_msg.length == 0) {
         //     let msg = "보낼 메시지를 입력해주세요.\n사용법: [[사용자 이름]] 보낼 메시지";
         //     sendReply(msg, ADMIN_CHANNEL);
         //   } else {
         //     let target_channel = dm_channels.find(function(element) {
         //       return element.user === target_user.id;
         //     });

         //     sendReply(target_msg, target_channel.id);
         //     sendReply(target_user_name + "님에게 메시지 전송 완료!", ADMIN_CHANNEL);
         //   }
         // }
        } else {
          /* this message is from a normal user */

          user = users.find(function(element) {
            return element.id === user_id; });
          let username = user.profile.display_name;
          if (!username || username.length == 0) {
            username = user.profile.real_name;
          }
          if (payload.event.channel_type === 'im') {
            let msg = '[' + username + '] ' + text;
            sendReply(msg, ADMIN_CHANNEL);
          } else if (payload.event.channel_type === 'channel') {
          }
        }
      }
    }
});

var sendReply = function(message, channel) {
  let payload_reply = {
    'text': message,
    'channel': channel };

  request.post(
      { 
        headers: {
          'content-type' : 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + BOT_TOKEN },
        url: "https://slack.com/api/chat.postMessage",
        body: payload_reply,
        json: true
      },
      function (error, response, body) {
        if (error) {
          return console.error('reply failed: ', error);
        }
        console.log("reply sent: ", body);
      }
  ); 
};

var getUsers = function() {
  request.post(
      {
        headers: {
          'content-type' : 'application/json; charset=utf-8',
          'Authorization': 'Bearer ' + BOT_TOKEN },
        url: 'https://slack.com/api/users.list',
        body: {},
        json: true
      },
      function (error, response, body) {
        if (error) {
          return console.error('get users failed: ', error);
        }

        console.log('got users');

        users = body.members;
      }
  );
};

var getDMChannels = function () {
  request.get(
      {
        headers: {
          'content-type' : 'application/x-www-form-urlencoded; charset=utf-8',
          'Authorization': 'Bearer ' + BOT_TOKEN },
        url: 'https://slack.com/api/conversations.list?types=im',
      },
      function (error, response, body) {
        if (error) {
          return console.error('get users failed: ', error);
        }
        
        console.log('got dm channels');
        body = JSON.parse(body); // this is required since GET request returns with raw string

        dm_channels = body.channels;
      }
  );
};

var sendAll = function(target_msg) {
  let human_users = users.filter(x => !x.is_bot && !(x.id === 'USLACKBOT'));
  let target_users_id = human_users.map(x => x.id);
  for (var i in target_users_id) {
    let tuid = target_users_id[i];
    let target_channel = dm_channels.find(x => x.user === tuid);
    sendReply(target_msg, target_channel.id);
  }
};
