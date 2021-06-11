module.exports = {
    'generate:before': generator => {
        const asyncapi = generator.asyncapi;
        const schemas = asyncapi.allSchemas();

        let discriminatorSchemas = new Map();

        // find all schemas which have a discriminator 
        for (let [schemaName, schemaObj] of schemas) {
            if(schemaObj.discriminator()) {
                schemaObj._json['x-java-sub-classes'] = [];                
                discriminatorSchemas.set(schemaName,schemaObj);
            }
        }

        // collect all the schemas which use a discriminator
        for (let [schemaName, schemaObj] of schemas) {
            if(schemaObj.allOf()) {
              for(let [allOfIdx, allOfObj] of Object.entries(schemaObj.allOf())) {
                  if(allOfObj.discriminator()) {
                      // check if the discriminator was found in the schemas before
                      if(discriminatorSchemas.has(allOfObj.uid()) === false) {
                        throw "Parent schema: "+allOfObj.uid()+" was not declared for: "+schemaName;
                      }
                      // add subtype to dicriminator schema
                      discriminatorSchemas.get(allOfObj.uid())._json['x-java-sub-classes'].push(schemaName);

                      // add impl class to schema
                      schemaObj._json['x-java-impl-information'] = { 
                        implClass:  allOfObj.uid(),
                        discriminatorField: allOfObj.discriminator() 
                      };
                      
                  }
                  
              }
            }
        }
    }


}