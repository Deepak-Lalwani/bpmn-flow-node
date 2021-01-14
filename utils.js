const getProcessJSON = (result_array) => {
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

        let top = 0, left = 0, prventInfinteLoop = 0;
        let fromOperator=0, toOperator=0, linksIndex = 0;

      //loop for creating operators
      operatorLoop: for(var operatorIndex=0; operatorIndex<result_array.length; operatorIndex++){

        var operatorKeys = Object.keys(emptyOperators.operators);
        for(var operatorKey=0; operatorKey<operatorKeys.length; operatorKey++){
            if(result_array[operatorIndex].linked_process_type === emptyOperators.operators[operatorKeys[operatorKey]].properties.title){
                continue operatorLoop;
            }
        }
        let key = "operator" + eval(operatorIndex + 1);
        top = top + 20;
        left = left + 40;
        emptyOperators.operators[key] = {
          top: top,
          left: left,
          properties: {
            title: result_array[operatorIndex].linked_process_type,
            inputs: {
              /*input_1: {
                label: result_array[operatorIndex].possible_response,
              },*/
            },
            outputs: {
              output_1: {
                label: "",
              },
            },
          },
        };
        //console.log("title is: ", result_array[operatorIndex].linked_process_type);
      }

      for(var linksTraverseIndex=0; linksTraverseIndex<result_array.length; linksTraverseIndex++){
        if (
            result_array[linksTraverseIndex].linked_process_id == 3 &&
            result_array[linksTraverseIndex].parent_process_id == 312
          ) {
            prventInfinteLoop++;
            if (prventInfinteLoop > 1) break;
          }
          //claculate backwards routes 
          var operatorKeys = Object.keys(emptyOperators.operators);
          console.log('operator keys length', operatorKeys.length);
          for(var operatorKey=0; operatorKey<operatorKeys.length; operatorKey++){
                if(result_array[linksTraverseIndex].parent_process_name === emptyOperators.operators[operatorKeys[operatorKey]].properties.title){
                    console.log("For " + result_array[linksTraverseIndex].parent_process_name + "matched operator is" + operatorKeys[operatorKey]);
                    fromOperator = operatorKeys[operatorKey];

                    //find toOperator
                    for(var findToIndex=0; findToIndex<operatorKeys.length; findToIndex++){
                        if(result_array[linksTraverseIndex].linked_process_type == emptyOperators.operators[operatorKeys[findToIndex]].properties.title){
                            toOperator = operatorKeys[findToIndex];
                            console.log("and to operator is ", toOperator);
                            var inputKeys = Object.keys(emptyOperators.operators[operatorKeys[findToIndex]].properties.inputs);
                            var newKeyName = "input_" + eval(inputKeys.length + 1);
                            emptyOperators.operators[operatorKeys[findToIndex]].properties.inputs[newKeyName] = {
                                "label": result_array[linksTraverseIndex].possible_response
                            };
                            
                            emptyOperators.links[linksIndex] = {
                                fromOperator: fromOperator,
                                fromConnector: "output_1",
                                fromSubConnector: 0,
                                toOperator: toOperator,
                                toConnector: newKeyName,
                                toSubConnector: 0,
                            };
                            linksIndex++;
                        }
                    }
                }
            }

            //calculate forwards routes
            /*
            for(var operatorKey2=0; operatorKey2<operatorKeys.length; operatorKey2++){
                if(result_array[linksTraverseIndex].linked_process_type === emptyOperators.operators[operatorKeys[operatorKey2]].properties.title){


                }

            }
            */
        }

        console.log("empty operatos are ", JSON.stringify(emptyOperators));

      return JSON.stringify(emptyOperators);

};
module.exports = {
     getProcessJSON
    };