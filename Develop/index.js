var inquirer = require("inquirer");

var fs = require('fs');

const axios = require("axios");

//Using inquirer npm to access prompt to ask the user for GitHub username, name of project, description, table of contents, instructions on installing, usage, license, contributing, tests.
inquirer.prompt([
  {
    type: "input",
    name: "github_username",
    message: "Enter your GitHub username:"
  },

  {
    type: "input",
    name: "project_title",
    message: "Enter the title of your project:"
  },

  {
    type: "input",
    name: "description",
    message: "Enter a description of your project:"
  },

  {
    type: "input",
    name: "installation",
    message: "Enter the step-by-step installation instructions:"
  },

  {
    type: "input",
    name: "usage",
    message: "Enter Instructions and examples for use. Include links to screenshots as needed: "
  },

  {
    type: "input",
    name: "contributors",
    message: "Enter contributors, if any, with links to their GitHub profiles. Include the full http/https protocol extension for each, separating them with a comma."
  },

  {
    type: "list",
    message: "Choose a license for the project:",
    name: "license",
    choices: [
      "GNU AGPLv3",
      "GNU GPLv3",
      "GNU LGPLv3",
      "Mozilla Public 2.0",
      "Apache 2.0",
      "MIT",
      "Boost Software 1.0",
      "The Unlicense",
      "None"
    ]
  },

  {
    type: "input",
    name: "tests",
    message: "Write test cases for your application here. Include any screenshot links if needed."
  }

]).then(function(answers) {

    const { github_username, 
            project_title, 
            description, 
            installation, 
            usage,
            contributors, 
            license,
            tests
        } = answers;

    createFileContent(github_username, project_title, description, installation, usage, contributors, license, tests);
});

function createFileContent(github_username, project_title, description, installation, usage, contributors, license, tests) {

    let fileContent = "";

    //README file content goes here:
    // .trim() takes all the extra space that the user may input and takes it out.
        github_username.trim();

    if (github_username !== "") {
        
        const github_query = `https://api.github.com/users/${github_username}/events/public`;

        axios.get(github_query).then(function(github_userdata) {

        //user email address:
        let gitHubEmail = getEmailAddress(github_userdata);

        //user profile image:
        let gitHubProfileImage = getProfileImage(github_userdata);

        fileContent += `## Questions \r\n`;

        fileContent += `![GitHub Profile Image](${gitHubProfileImage}) \r\r\n ${gitHubEmail}`;

        createFile(fileContent);
        }); 
    }
    
    project_title.trim();

    license.trim();

    let licenseBadge;

    let licenseLink;

    if (license !== "None") {
        licenseBadge = getLicenseBadge(license);
        licenseLink = getLicenseLink(license);
    }

    if (project_title != "" && license !== "None") {
        fileContent += `# ${project_title} ${licenseBadge} \r\r\n`;
    }
    else if (project_title != "" && license !== "None") {
        fileContent += `# ${project_title} ${licenseBadge} \r\r\n`;
    }
    else if (project_title != "") {
        fileContent += `# ${project_title} \r\r\n`;
    }
    else if (project_title !== "") {
        fileContent += `# ${project_title} \r\r\n`;
    }

    description.trim();

    if (description != "") {
        fileContent += `## Description \r\n`;
        fileContent += `${description} \r\r\n` ;
    }

    fileContent = tableOfContents(fileContent, installation, usage, contributors, license, tests, github_username);

    if (installation != "") {
        fileContent += `## Installation \r\n`;
        let convertedImages = convertImages(installation);
        let convertedLinks = createLinks(convertedImages);
        let stepList = createOrderedList(convertedLinks);
        fileContent += `${stepList} \r\n`;
    }

    if (usage != "") {
        fileContent += `## Usage \r\n`;
        let convertedImages = convertImages(usage);
        let convertedLinks = createLinks(convertedImages);
        let stepList = createOrderedList(convertedLinks);
        fileContent += `${stepList} \r\r\n`;
    }

    if (contributors != "") {
        fileContent += `## Contributors \r\n`;
        let bulletList = createBulletList(contributors);
        let convertedLinks = createLinks(bulletList);
        fileContent += `${convertedLinks} \r\n`;
    }

    fileContent += `## License \r\n`;
    if (license != "None") {
        fileContent += `${project_title} is [${license}](${licenseLink}) licensed \r\r\n`;
    }
    else {
        fileContent += "There is not a license for this application. \r\r\n";
    }


    if (tests != "") {
        fileContent += `## Tests \r\n`;
        let convertedImages = convertImages(tests);
        let convertedLinks = createLinks(convertedImages);
        let stepList = createOrderedList(convertedLinks); 
        fileContent += `${stepList} \r\r\n`;
    }
}

//This Function take all the info from filecontent and creates the actual readme.md
function createFile(fileContent) {

    fs.writeFile("README.md", fileContent, function(err) {
    if (err) {
        return console.log(err);
    }
    console.log("README.md file created.");
  });
}

// This function will get the license and the link for it
function getLicenseLink(license) {

    let licenseLink;

    switch(license) {
        case "GNU AGPLv3": licenseLink = "https://www.gnu.org/licenses/agpl-3.0.html";
        break;

        case "Mozilla Public 2.0": licenseLink = "https://www.mozilla.org/en-US/MPL/2.0/";
        break;

        case "Apache 2.0": licenseLink = "https://www.apache.org/licenses/LICENSE-2.0.html";
        break;

        case "MIT": licenseLink = "https://choosealicense.com/licenses/mit/";
        break;

        case "Boost Software 1.0": licenseLink = "http://zone.ni.com/reference/en-XX/help/373194E-01/cdaq-foss/boost-license-v-1-0/";
        break;

        case "The Unlicense": licenseLink = "https://unlicense.org/";
        break;
    }
    return licenseLink;
}

function convertImages(usage) {

    const imageTypes = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".raw", ".bmp"];

    let newString = "";

    let isImage = false;

    let usageList = usage.split(" ");

    //loop through usage:
    for (let i = 0; i < usageList.length; i++) {

            isImage = false;
            
            //loop through imageTypes:
            for (let image in imageTypes) {

                let imgExt = usageList[i].indexOf(imageTypes[image]);

                if (imgExt !== -1) {

                    //this is an image
                    isImage = true;

                    //find image:
                    let imgStart = usageList[i].lastIndexOf(" ", imgExt);

                    let imgEnd = imgExt + imageTypes[image].length;

                    let img = usageList[i].substring(imgStart, imgEnd);

                    img = img.trim();

                    //find image alias:
                    let aliasStart = usageList[i].lastIndexOf("/", imgExt);

                    let aliasEnd = imgExt;

                    let alias = usageList[i].substring(aliasStart + 1, aliasEnd);

                    newString += createImage(alias, img);
                }
            }
            //this is not an image:
            if (isImage === false) {
                newString += `${usageList[i]} `;
            }
    }
    return newString;
}

// this function will take the steps and make them into an ordered list for usage, installation, and tests section
function createOrderedList(steps) {

    let containsList = steps.search(/\d\./);

    if (containsList !== -1) {

        steps = steps.split(/\d\./);

        let stepList = "";

        for (let i = 0; i < steps.length; i++) {
             if (steps[i] !== "") {
                stepList += `${i}. ${steps[i]} \n`;
            }
        } 
        return stepList;
    }
    else {
        return steps;
    }
}

//This function takes the contributors and puts them in a bulleted list
function createBulletList(list) {

    let containsList = list.search(",");
    
        if (containsList !== -1) {
            list = list.split(",");
            let bulletList = "";
                for (let i = 0; i < list.length; i++) {
                    let item = list[i].trim();
                    if (item !== "") {
                        bulletList += `* ${item} \n`;
                    }
                } 
                return bulletList;
        }
        else {
            return list;
        }
}

function createLinks(string) {

    //search for a link:
    let containsList = string.search("http");

        if (containsList !== -1) {

            let input = string.split(" ");

            let newString = "";

            for (let word in input) {

                if (input[word].indexOf("http") !== -1 && input[word].indexOf("![") === -1) {
                    //link:
                    let link = input[word];
                    //find alias:
                    let aliasStart = link.indexOf("//") + 2;

                    let aliasEnd = link.length;

                    let alias = link.substring(aliasStart, aliasEnd);

                    //add to new string:
                    newString += createLink(alias, link);
                }
                else {
                    //if not a link, add the word as is:
                    newString += `${input[word]} `;
                }
            }
            return newString;
        }
        else {
            return string
        }
}

function createImage(title, image_link) {

    if (image_link.indexOf("http") === -1) {
        //this is a relative path image:
        image_link = `/${image_link}`;
    }
    return `![${title}](${image_link})`;
}

function createLink(title, link) {
    return `[${title}](${link})`;
}

function getLicenseBadge(license) {
    //create license badge:
    license = license.split(" ").join("%20");

    const licenseBadge = createBadge("license", license);

    return licenseBadge;
}

function createBadge(type, title) {
    return `![${type}](https://img.shields.io/badge/${type}-${title}-blue)`;
}

function getEmailAddress(github_userdata) {

    for (let i = 0; i < github_userdata.data.length; i++) {

        if (github_userdata.data[i].payload.hasOwnProperty("commits")) {

            available = true;
            const gitHubEmail = github_userdata.data[i].payload.commits[0].author.email;
            return gitHubEmail;
        }
    }
    return "User profile email is unavailable";
}

function getProfileImage(github_userdata) {

    for (let i = 0; i < github_userdata.data.length; i++) {

        if (github_userdata.data[i].actor.hasOwnProperty("avatar_url")) { 
            const gitHubProfileImage = github_userdata.data[i].actor.avatar_url;
            return gitHubProfileImage;
        }
    }
    return "User profile image unavailable";
}

function tableOfContents(fileContent, installation, usage, contributors, license, tests, github_username) {

    let table_of_contents = [];

    if (installation !== "") {
        table_of_contents.push(`* [Installation](#installation)`);
    }

    if (usage !== "") {
        table_of_contents.push(`* [Usage](#usage)`);
    }

    if (contributors !== "") {
        table_of_contents.push(`* [Contributors](#contributors)`);
    }

    if (license !== "") {
        table_of_contents.push(`* [License](#license)`);
    }

    if (tests !== "") {
        table_of_contents.push(`* [Tests](#tests)`);
    }

    if (github_username !== "") {
        table_of_contents.push(`* [Questions](#questions) \r\n`);
    }

    fileContent += `## Table of Contents \r\n`;

    for (let i = 0; i < table_of_contents.length; i++) {
        fileContent += `${table_of_contents[i]} \r\n`;
    }
    return fileContent;
}