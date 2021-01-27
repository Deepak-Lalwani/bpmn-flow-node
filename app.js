const express = require("express");
const { Client } = require("pg");
const path = require("path");

const config = require("./config");
const { getProcessJSON, getBackwardsProcessJSON, getForwardProcessJSON } = require("./utils");

const app = express();

app.use("/", express.static(__dirname + "/public"));

const client = new Client({
  user: config.username,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

client.connect();

function findALLIndex(result_array, val) {
  var index = [],
    i;
  for (i = 0; i < result_array.length; i++) {
    if (result_array[i].parent_process_id == val) {
      index.push(i);
    }
  }
  return index;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/demo.html"));
});

app.get("/error", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/errorPage.html"));
});

app.get("/get-bpmn-process", async (req, result) => {
  const task_type = req.query.task_type;
  const forward_check = req.query.is_forward;
  const backwards_check = req.query.is_backwards;
  let query = "";
  let query2 = "";

  if (req.query.is_forward == "true") {
    query = `select * from "task_manager"."get_process_vizualization_forward"('${task_type}')`;
  } else if (req.query.is_backwards == "true") {
    query = `select * from "task_manager"."get_process_vizualization_backwards"('${task_type}')`;
  } else {
    query = `select * from "task_manager"."get_process_vizualization_forward"('${task_type}')`;
    query2 = `select * from "task_manager"."get_process_vizualization_backwards"('${task_type}')`;
  }

  let result_array = [];
  //query = `select * from "task_manager"."get_reverse_bpmn_process"('${task_type}')`;

  client.query(query, async (err, res) => {
    if (err) {
      console.error("We got an error!! : ", err);
      return res.end("{}");
    }
    for (let row of res.rows) {
      result_array.push(row);
    }
    if (result_array.length > 0) {
      //const resultJson = await getProcessJSON(result_array, backwards_check);
      var resultJson = "{}";

      if (req.query.is_forward == "true") {
        resultJson = await getForwardProcessJSON(result_array);
        result.end(resultJson);
      } else if (req.query.is_backwards == "true") {
        resultJson = await getBackwardsProcessJSON(result_array);
        result.end(resultJson);
      } else {
        await client.query(query2, async (err, res) => {
          if (err) {
            return res.end("{}");
          }
          for (let row of res.rows) {
            result_array.push({
              ...row,
              is_backwards: true
            });
          }
          resultJson = await getProcessJSON(result_array);
          result.end(resultJson);
        });
      }
      //result.end(resultJson);
    } else {
      result.end("{}");
    }
    // client.end();
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("App started ....");
});
