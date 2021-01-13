function getNewFormattedData(inputData) {
  let result_array = [];

  inputData.map((row) => {
    if (row.f1) result_array.push(row.f1);
  });
  const result = manipulateJSONStructure(result_array);
  return result;
}

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

function manipulateJSONStructure(result_array) {
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
      !operator_keys.includes(emptyOperators.links[link_keys[i]]["toOperator"])
    ) {
      delete emptyOperators.links[link_keys[i]];
    }
  }

  console.log("emptyOperators is", JSON.stringify(emptyOperators));
  return JSON.parse(JSON.stringify(emptyOperators).replace(/_/g, "_<wbr/>"));
}
