const axios = require('axios');

async function getLatestVersion() {
    try {
        const response = await axios.get('https://api.github.com/repos/Noaaam/discord-v14-bot-ticketSystem/releases/latest');
        const latestVersion = response.data.tag_name;
        return latestVersion;
    } catch (error) {
        console.error('Error while retrieving the latest version, '.orange, error.message);
        return null;
    }
}

function checkVersion(currentVersion) {
    getLatestVersion().then((latestVersion) => {
        if (currentVersion < latestVersion) {
            console.log('Attention, a new update is available, please install it. \nhttps://github.com/Noaaam/discord-v14-bot-ticketSystem/'.red);
        } else {
            console.log('You have the latest version of the code.'.green);
        }
    });
}

module.exports = { getLatestVersion, checkVersion };
