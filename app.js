require("dotenv").config();
const pg = require("pg");
const express = require("express");
const bp = require("body-parser");
const { set } = require("express/lib/application");
const app = express();
const Port = 5000;

var admin = require("firebase-admin");

var serviceAccount = require(__dirname + "//saigym.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//get date this will push the notification to the channel everyday at 6:15am if there's any birthday

function checkDate() {
  let date = new Date();
  let hours = date.getHours();
  console.log(hours);
  let minutes = date.getMinutes();

  //setting the last value 0 which is date means we would like to get first day of the month - 1 which is last day of prevous month

  let lastDayOfTheMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // console.log("LOM: ",lastDayOfTheMonth.getDate());
  // console.log("Today: ",date.getDate());

  if (minutes == 15 && hours == 6) {
    checkForBirthday();
  } else if (minutes == 25 && hours == 8) {
    planDueNotification();
  } else if (minutes == 25 && hours == 5) {
    planDueNotification();
  } else if (minutes == 25 && hours == 7) {
    amountDueNotitfication();
  } else if (minutes == 25 && hours == 20) {
    amountDueNotitfication();
  } else if (
    date.getDate() == lastDayOfTheMonth &&
    minutes == 25 &&
    hours == 8
  ) {
    reportGeneratedNotification();
  }
}

//send notification to check plan due

function planDueNotification() {
  const query =
    "select count(*) from gmr.dues join gmr.members on gmr.members.member_id = gmr.dues.member_id where due_date<current_date and is_active=true";
  pool.query(query, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      var result = result.rows[0].count;

      if (result.length > 0) {
        const message = {
          notification: {
            title: "Plan due",
            body: "We have " + result + " members with plan due!!",
          },
          data: {
            activity: "plan due",
          },
          android: {
            notification: {
              channelId: "MyNotification",
            },
          },
          topic: "common",
        };

        // Send a message to devices subscribed to the provided topic.
        admin
          .messaging()
          .send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
      }
    }
  });
}

function reportGeneratedNotification() {
  const message = {
    notification: {
      title: "Monthly Report generated",
      body: "It's last day of the month, find out your report by clicking here!!",
    },
    data: {
      activity: "report",
    },
    android: {
      notification: {
        channelId: "ReportGenerated",
      },
    },
    topic: "common",
  };

  // Send a message to devices subscribed to the provided topic.
  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

function festivalWishes() {
  const message = {
    notification: {
      title: "Happy Diwali",
      body: "Click me to share on what's app.",
    },
    data: {
      activity: "message",
      msg: "Sai gym wishes you a very happy diwali🎇🧨✨🎉",
    },
    android: {
      notification: {
        channelId: "ReportGenerated",
      },
    },
    topic: "common",
  };

  // Send a message to devices subscribed to the provided topic.
  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

function amountDueNotitfication() {
  const query =
    "select count(*) from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_cleared=false and is_active=true and current_date>=due_promise";
  pool.query(query, (error, result) => {
    if (error) {
    } else {
      var result = result.rows[0].count;
      var topic = "common";
      if (result.length > 0) {
        const message = {
          notification: {
            title: "Amount due",
            body:
              "We have " +
              result +
              " members with their pending amount not recovered!!",
          },
          android: {
            notification: {
              channelId: "MyNotification",
            },
          },
          data: {
            activity: "amount due",
          },
          topic: topic,
        };

        // Send a message to devices subscribed to the provided topic.
        admin
          .messaging()
          .send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
      }
    }
  });
}

function checkForBirthday() {
  const query =
    "select count(*) from gmr.members where date_part('day',date_of_birth)= date_part('day',current_date) and date_part('month',date_of_birth)=date_part('month',current_date)";
  pool.query(query, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      var result = Number(result.rows[0].count);
      if (result > 0) {
        var topic = "common";

        // var message = {
        //   notification: {
        //     "title": 'Birthday',
        //     "body": "There's a member with birthday🎂"
        //   },
        //   "android": {
        //       "android_channel_id": "MyNotification"

        // },
        //   topic: topic
        // };
        //to include channel id

        const message = {
          notification: {
            title: "Birthday",
            body: "There's " + result + " member with a birthday today🎂",
          },
          android: {
            notification: {
              channelId: "MyNotification",
            },
          },
          data: {
            activity: "birthday",
          },
          topic: topic,
        };

        // Send a message to devices subscribed to the provided topic.
        admin
          .messaging()
          .send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
      }
    }
  });
}

function run() {
  setInterval(checkDate, 60000);
}

setInterval(wakeDb, 720000);

function wakeDb() {
  // const query="select member_id,name,medical_history,email,is_active,surname,ph_no,date_of_birth from gmr.members where date_part('day',date_of_birth)= date_part('day',current_date) and date_part('month',date_of_birth)=date_part('month',current_date)"
  // pool.query(query,(error,result)=>{
  //     if(error){
  //         console.log(error)
  //     }else{
  //         console.log("DB called with data "+result.rows);
  //     }
  // })

  console.log("Keeping the server active code runs every 12 mins");
}

app.use(
  bp.urlencoded({
    extended: false,
  })
);

app.use(bp.json());

//pg connection

const pool = new pg.Pool({
  user: "sai_gym_user",
  host: "dpg-ce1ivp6n6mpu84o2qle0-a.oregon-postgres.render.com",
  database: "sai_gym",
  password: "UOpMw1AsZuOefkkrvh0tGXzhWB2flVuT",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect();

// reportGeneratedNotification();
// festivalWishes();
// planDueNotification();
// checkForBirthday();
// amountDueNotitfication();

app.post(
  "/getMemberInfokloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const query = "select * from gmr.members where member_id=$1";
    const values = [member_id];
    pool.query(query, values, (error, result) => {
      if (error) {
      } else {
        res.send(result.rows[0]);
      }
    });
  }
);

app.post(
  "/addMemberskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");

    const member_id = req.body.member_id;
    const name = req.body.name;
    const surname = req.body.surname;
    const dob = req.body.dob;
    const age = req.body.age;
    const email = req.body.email;
    const medical_history = req.body.medical_history;
    const ph_no = req.body.ph_no;
    const user_id = req.body.user_id;

    const query =
      "insert into gmr.members (member_id,name,surname,date_of_birth,age,email,medical_history,ph_no,user_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    const values = [
      member_id,
      name,
      surname,
      dob,
      age,
      email,
      medical_history,
      ph_no,
      user_id,
    ];
    pool.query(query, values, (error, result) => {
      if (error) {
        console.log(error);
        if (error.code == "23505") {
          res.send("Phone number Already Exists!!");
        }
      } else {
        console.log(result);
        res.send("Added");
      }
    });
    console.log("Connection ended!!");
  }
);

app.post(
  "/getMemberIDkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query = "select max(member_id) from gmr.members as maxID";
    pool.query(query, (error, result) => {
      if (error) {
        console.log("Something went wrong");
      } else {
        console.log(result.rows[0].max);
        res.send(result.rows[0].max.toString());
      }
    });
  }
);

app.post(
  "/getAllMemberskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select member_id,name,medical_history,email,is_active,surname,ph_no,date_of_birth from gmr.members order by member_id desc";
    pool.query(query, (error, result) => {
      if (error) {
        console.log("Something went wrong");
      } else {
        // console.log(result.rows[0])
        res.send(result.rows);
      }
    });
  }
);

//adding collections

app.post(
  "/addCollectionkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const plan = req.body.plan;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    const amount = req.body.amount;
    const due_date = req.body.due_date;
    const due_promise = req.body.due_promise;
    const discount = req.body.discount;
    const due_amount = req.body.due_amount;
    const previous_due = req.body.previous_due;
    const due_cleared = req.body.due_cleared;

    const query =
      "insert into gmr.collections(member_id,plan,from_date,to_date,amount_paid,due_date,due_promise,discount,due_amount,previous_due,due_cleared) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";

    const query2 =
      "select * from gmr.collections where date_part('day',from_date)= date_part('day',current_date) and date_part('month',from_date)=date_part('month',current_date) and date_part('year',from_date)=date_part('year',current_date) and member_id=$1";

    const value2 = [member_id];
    pool.query(query2, value2, (error1, result1) => {
      if (error1) {
        console.log("Error1");
        res.send(error1);
      } else {
        console.log(result1.rows);

        if (result1.rowCount == 0) {
          const values = [
            member_id,
            plan,
            from_date,
            to_date,
            amount,
            due_date,
            due_promise,
            discount,
            due_amount,
            previous_due,
            due_cleared,
          ];
          pool.query(query, values, (error, result) => {
            if (error) {
              res.send(error);
            } else {
              console.log(result.rows);
              res.send("Successfully added!!");
            }
          });
        } else {
          res.send("Data already exists. You can edit the plan instead!!");
        }
      }
    });
  }
);

//get collection id

app.post(
  "/getCollectionIDkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query = "select max(collection_id) from gmr.collections";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows[0].max.toString());
      }
    });
  }
);

//last member added bby the user to get add member during plan

app.post(
  "/getLastAddedkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select max(member_id) from gmr.members as maxID where user_id=1";
    pool.query(query, (error, result) => {
      if (error) {
        console.log("Something went wrong");
      } else {
        console.log(result.rows[0].max);
        res.send(result.rows[0].max.toString());
      }
    });
  }
);

app.post(
  "/getPlanInfokloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const query =
      "select collection_id, plan,from_date,to_date,amount_paid,due_date,due_promise,discount,due_amount,previous_due from gmr.collections where member_id=$1 order by collection_id desc limit 1";
    const values = [member_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//getBirthday

app.post(
  "/getBirthdaykloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "select member_id,name,medical_history,email,is_active,surname,ph_no,date_of_birth from gmr.members where date_part('day',date_of_birth)= date_part('day',current_date) and date_part('month',date_of_birth)=date_part('month',current_date)";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/isActivekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query = "select * from gmr.members where is_active=true";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/isInActivekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query = "select * from gmr.members where is_active=false";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/todayDuekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_date=current_date or due_promise=current_date and due_cleared=false";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/planDuekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.dues join gmr.members on gmr.members.member_id = gmr.dues.member_id where due_date<current_date and is_active=true";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/dueskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const due_date = req.body.due_date;
    var query = "update gmr.dues set due_date=$1 where member_id=$2";
    var values = [due_date, member_id];

    pool.query(query, values, (error, result) => {
      if (error) {
        res.send("Error : " + error);
      } else if (result) {
        if (result.rows.toString().length == 0) {
          //if no data
          query = "insert into gmr.dues (member_id,due_date) values($1,$2)";
          values = [member_id, due_date];
          pool.query(query, values, (error1, result1) => {
            if (error1) {
              res.end();
            } else if (result1) {
              res.end();
            }
          });
        }
        res.end();
      }
    });
  }
);

app.post(
  "/alldueskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_cleared=false";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/dueClearedkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const collection_id = req.body.collection_id;
    const query =
      "update gmr.collections set due_cleared=true where collection_id=$1";
    const values = [collection_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send("Cleared");
      }
    });
  }
);

app.post(
  "/upcomingDueskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where current_date = due_date - INTERVAL '2 DAYS'";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/totaldueofMemkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;

    const query =
      "select sum(due_amount) from gmr.collections where member_id=$1 and due_cleared=false";

    const values = [member_id];
    pool.query(query, values, (Error, Result) => {
      if (Error) {
        console.log(Error);
      } else {
        res.send(Result.rows[0].sum.toString());
      }
    });
  }
);

// app.post('/clearDue',(req,res)=>{
//     const query="update gmr.collections set "
//     pool.query(query,(error,result)=>{
//         if(error){
//             res.send(error)
//         }else{
//             res.send(result.rows);
//         }
//     })
// })

//make member active

app.post(
  "/activateMemberkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const query =
      "update gmr.members set is_active = true where member_id = $1";
    const values = [member_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//make member inactive

app.post(
  "/inActivateMemberkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.member_id;
    const query =
      "update gmr.members set is_active = false where member_id = $1";
    const values = [member_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//get member info with phoneNumber

app.post(
  "/getPhonekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const member_id = req.body.ph_no;
    const query = "select * from gmr.members where ph_no = $1";
    const values = [member_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//get list of all the dues

app.post(
  "/getDuesMemberkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_cleared=false and is_active=true";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/getDuesMemberskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_cleared=false and is_active=true and current_date>=due_promise";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//collection report monthly

app.post(
  "/collectionskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where date_part('month',added_on)=date_part('month',current_date) and date_part('year',added_on)=date_part('year',current_date) order by added_on desc";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/yearlyCollectionskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select * from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where date_part('year',added_on)=date_part('year',current_date) order by added_on desc";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/yearlyCollectionSumkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select sum(amount_paid) from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where date_part('year',added_on)=date_part('year',current_date)";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/getSumkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const date = req.body.date;
    const query =
      "select sum(amount_paid) from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where date_part('day',added_on) = $1   and date_part('month',added_on)=date_part('month',current_date) and date_part('year',added_on)=date_part('year',current_date)";
    const values = [date];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/totalPendingCollectionskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "select sum(due_amount) from gmr.collections join gmr.members on gmr.members.member_id = gmr.collections.member_id where due_cleared=false";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        if (result.rows[0].sum == null) {
          res.send("0");
        } else {
          res.send(result.rows[0].sum.toString());
        }
      }
    });
  }
);

//clear due
app.post(
  "/clearDuekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const collection_id = req.body.collection_id;

    const query =
      "update gmr.collections set due_cleared=true where collection_id=$1";
    const values = [collection_id];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

//clear partial due

app.post(
  "/clearDuePartialkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const collection_id = req.body.collection_id;
    const pending_amount = req.body.pending_amount;

    const query =
      "update gmr.collections set due_amount=$2 where collection_id=$1";
    const values = [collection_id, pending_amount];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/monthlyCollectionkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");

    const query =
      "select sum(amount_paid) from gmr.collections where date_part('month',added_on)=date_part('month',current_date) and date_part('year',added_on)=date_part('year',current_date)";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        if (result.rows[0].sum == null) {
          res.send("0");
        } else {
          res.send(result.rows[0].sum.toString());
        }
      }
    });
  }
);

app.post(
  "/isaactivekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select count(*) from gmr.dues where  date_part('day',due_date)> date_part('day',current_date) and date_part('month',due_date)>=date_part('month',current_date) and date_part('year',due_date)=date_part('year',current_date)";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows[0].count.toString());
      }
    });
  }
);

app.post(
  "/isiinActivekloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    const query =
      "select count(member_id) from gmr.members where is_active=false";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows[0].count.toString());
      }
    });
  }
);

//new app code
//login

app.post("/login", (req, res) => {
  req.header("Content-Type", "application/json");
  const userName = req.body.userName;
  const password = req.body.password;

  const query =
    "select count(*) from gmr.users where user_name=$1 and password=$2";
  const values = [userName, password];
  pool.query(query, values, (error, result) => {
    if (error) {
      res.send(error);
    } else {
      res.send(result.rows[0].count.toString());
    }
  });
});

app.post(
  "/editMemberInfokloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const name = req.body.name;
    const surname = req.body.surname;
    const ph_no = req.body.ph_no;
    const dob = req.body.dob;
    const member_id = req.body.member_id;

    const query =
      "update gmr.members set name=$1 , surname = $2, ph_no =$3,date_of_birth = $4 where member_id=$5";
    const values = [name, surname, ph_no, dob, member_id];

    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send("Updated successfully!!");
      }
    });
  }
);

//check previous payment record

app.post(
  "/paymentRecordkloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    var member_id = req.body;

    const data = JSON.parse(JSON.stringify(member_id[0]));
    member_id = data.member_id;

    const query = "select * from gmr.collections where member_id = $1";
    const values = [member_id];

    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/notificationskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "select is_called, message from gmr.notifications where notification_id=1";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/doneCallingNotificationskloowwuijs2368iyrecsawqewrtw" +
    process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const query =
      "update gmr.notifications set is_called= true where notification_id=1";
    pool.query(query, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post(
  "/setNotificationskloowwuijs2368iyrecsawqewrtw" + process.env.user_key,
  (req, res) => {
    req.header("Content-Type", "application/json");
    const message = req.body.message;
    const query =
      "update gmr.notifications set is_called= 'false', message = $1 where notification_id=1";
    const values = [message];
    pool.query(query, values, (error, result) => {
      if (error) {
        res.send(error);
      } else {
        res.send(result.rows);
      }
    });
  }
);

app.post("/checkInternet", (req, res) => {
  res.send("202");
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/getAllMember", (req, res) => {
  const query =
    "select member_id,name,medical_history,email,is_active,surname,ph_no,date_of_birth from gmr.members order by member_id desc";
  pool.query(query, (error, result) => {
    if (error) {
      console.log(error);
      console.log("Something went wrong");
    } else {
      // console.log(result.rows[0])
      res.send(result.rows);
    }
  });
});

process.on("unhandledRejection", (reason, promise) => {
  // do something
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running at port " + Port);
});
