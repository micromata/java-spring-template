const fs = require('fs-extra');

module.exports = {
    
    /**
     * When onlyModel is set we remove all not needed files.
     * This is done in a processor so we don't need to put to many if checks into the templates itself
     *
     * @param generator
     */
    'generate:after': generator => {

        let onlyModel = generator.templateParams['onlyModel'];

        if(onlyModel === 'true') {

            // remove gradle
            fs.removeSync(generator.targetDir + '/gradle');            
            fs.removeSync(generator.targetDir + '/build.gradle');
            fs.removeSync(generator.targetDir + '/gradle.properties');
            fs.removeSync(generator.targetDir + '/gradlew');
            fs.removeSync(generator.targetDir + '/gradlew.bat');
            
            // remove test 
            fs.removeSync(generator.targetDir + '/src/test');

            // remove docker
            fs.removeSync(generator.targetDir + '/src/main/docker');

            // remove application related stuff
            fs.removeSync(generator.targetDir + '/src/main/resources/application.yml');
            fs.removeSync(generator.targetDir + '/src/main/java/com/asyncapi/infrastructure');
            fs.removeSync(generator.targetDir + '/src/main/java/com/asyncapi/service');
            fs.removeSync(generator.targetDir + '/src/main/java/com/asyncapi/Application.java');
        }

        
    }    
};