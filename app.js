const express = require("express");
const { Client } = require("pg");
const path = require("path");

const config = require("./config");
const { getProcessJSON } = require("./utils");

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

app.get("/get-bpmn-process", (req, result) => {
  const task_type = req.query.task_type;
  const backwards_check = req.query.is_backwards;
  let query = "";
  if (req.query.is_backwards == "true") {
    query = `select * from "task_manager"."get_process_vizualization_backwards"('${task_type}')`;
  } else {
    query = `select * from "task_manager"."get_process_vizualization_forward"('${task_type}')`;
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
      const resultJson = await getProcessJSON(result_array, backwards_check);
      result.end(resultJson);
      return;
      let emptyOperators = {
        operators: {
          operator0: {
            top: 0,
            left: 0,
            properties: {
              title: result_array[0].parent_process_name,
              inputs: {},
              outputs: {
                output_1: {
                  label: "",
                },
              },
            },
          },
        },
        links: {
          0: {
            fromOperator: "operator0",
            fromConnector: "output_1",
            fromSubConnector: 0,
            toOperator: "operator1",
            toConnector: "input_1",
            toSubConnector: 0,
          },
        },
        operatorTypes: {},
      };

      let fromOperator,
        toOperator,
        linksIndex = 0;

      let top = 0,
        left = 0;
      let prventInfinteLoop = 0;

      loop1: for (var index = 0; index < result_array.length; index++) {
        // Condition to avoid null proceess.....
        if(result_array[index].linked_process_type == null){
          continue loop1;
        }

        //Condition to prevent infinite loop
        if (
          result_array[index].linked_process_id == 3 &&
          result_array[index].parent_process_id == 312
        ) {
          prventInfinteLoop++;
          if (prventInfinteLoop > 1) break;
        }


        var operator_keys = Object.keys(emptyOperators.operators);
        for (var i = 0, length = operator_keys.length; i < length; i++) {
          if (
            emptyOperators.operators[operator_keys[i]].properties.title ==
            result_array[index].linked_process_type
          ) {
            var responsePresent = false;
            var inputKeys = Object.keys(emptyOperators.operators[operator_keys[i]].properties.inputs);
            /*
            for(var ipKey=1; ipKey<=inputKeys.length; ipKey++){
              var keyName = "input_" + ipKey;
              if(emptyOperators.operators[operator_keys[i]].properties.inputs[keyName].label ==
                result_array[index].possible_response){
                  responsePresent = true;
                }
            }*/
            if(responsePresent == false) {
              var newKeyName = "input_" + eval(inputKeys.length + 1);
              emptyOperators.operators[operator_keys[i]].properties.inputs[newKeyName] = {
                "label": result_array[index].possible_response
              };
              let insideToOperator = operator_keys[i];
              let insideFromOperator = '';
              var operator_keys_v2 = Object.keys(emptyOperators.operators);
              for (var j = 0; j < operator_keys_v2.length; j++) {
                if (
                  emptyOperators.operators[operator_keys_v2[j]].properties.title ==
                  result_array[index].parent_process_name
                ) {
                  insideFromOperator = operator_keys_v2[j];

                  emptyOperators.links[linksIndex] = {
                    fromOperator: insideFromOperator,
                    fromConnector: "output_1",
                    fromSubConnector: 0,
                    toOperator: insideToOperator,
                    toConnector: newKeyName,
                    toSubConnector: 0,
                  };
                  linksIndex++;


                }
              }

            }
            
            continue loop1;
          }
        }
        let key = "operator" + eval(index + 1);
        top = top + 20;
        left = left + 40;
        emptyOperators.operators[key] = {
          top: top,
          left: left,
          properties: {
            title: result_array[index].linked_process_type,
            inputs: {
              input_1: {
                label: result_array[index].possible_response,
              },
            },
            outputs: {
              output_1: {
                label: "",
              },
            },
          },
        };
        if (
          result_array[index].parent_process_name ==
          result_array[0].parent_process_name
        ) {
          fromOperator = "operator0";
          toOperator = "operator" + eval(index + 1);
          emptyOperators.links[linksIndex] = {
            fromOperator: "operator0",
            fromConnector: "output_1",
            fromSubConnector: 0,
            toOperator: toOperator,
            toConnector: "input_1",
            toSubConnector: 0,
          };
          linksIndex++;

          //new change
          fromOperator = "operator" + eval(index + 1);
          const childProcesses = findALLIndex(
            result_array,
            result_array[index].linked_process_id
          );
          //console.log(index + "th call, parentProcess is" + fromOperator);
          //console.log(index + "th call, childProcess is" + childProcess);
          //toOperator = 'oprator' + eval(childProcess + 1);
          //}
          if (childProcesses.length > 0) {
            for (var index2 = 0; index2 < childProcesses.length; index2++) {
              toOperator = "operator" + eval(childProcesses[index2] + 1);
              //console.log(index + "th call, toOperator is" + toOperator);
              emptyOperators.links[linksIndex] = {
                fromOperator: fromOperator,
                fromConnector: "output_1",
                fromSubConnector: 0,
                toOperator: toOperator,
                toConnector: "input_1",
                toSubConnector: 0,
              };
              linksIndex++;
            }
          }

          //end new chagnes
        } else {
          const parentProcess = result_array.findIndex(
            (process) =>
              process.linked_process_id == result_array[index].parent_process_id
          );
          fromOperator = "operator" + eval(parentProcess + 1);
        }
        //const childProcesses = result_array.findIndex((process) => process.parent_process_id == result_array[index].linked_process_id);
        const childProcesses = findALLIndex(
          result_array,
          result_array[index].linked_process_id
        );
        //console.log(index + "th call, parentProcess is" + fromOperator);
        //console.log(index + "th call, childProcess is" + childProcess);
        //toOperator = 'operator' + eval(childProcess + 1);
        //}
        if (childProcesses.length > 0) {
          for (var index2 = 0; index2 < childProcesses.length; index2++) {
            toOperator = "operator" + eval(childProcesses[index2] + 1);
            //console.log(index + "th call, toOperator is" + toOperator);
            emptyOperators.links[linksIndex] = {
              fromOperator: fromOperator,
              fromConnector: "output_1",
              fromSubConnector: 0,
              toOperator: toOperator,
              toConnector: "input_1",
              toSubConnector: 0,
            };
            linksIndex++;
          }
        }
      }

      //remove unnecessary connectors
      var operator_keys = Object.keys(emptyOperators.operators);
      var link_keys = Object.keys(emptyOperators.links);
      for (var i = 0, length = link_keys.length; i < length; i++) {
        //console.log("operator keys are...",link_keys[i]);

        if (
          !operator_keys.includes(
            emptyOperators.links[link_keys[i]]["toOperator"]
          )
        ) {
          delete emptyOperators.links[link_keys[i]];
        }
      }

      console.log("it should not come here");

      result.end(JSON.stringify(emptyOperators));

      //console.log("emptyOperators is", JSON.stringify(emptyOperators));
    } else {
      result.end("{}");
    }
    // client.end();
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("App started ....");
});
