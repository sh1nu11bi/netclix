#!/usr/bin/env node

import 'babel-polyfill';
import phantom from 'phantom';
import ora from 'ora';
import debug from 'debug';
import inquirer from 'inquirer';

const log = debug('all');
const id = process.argv[2];

if (!id) {
    console.error('Usage: netclix [IMDB ID]');
    process.exit(0);
}

(async () => {
    let attempt = 0;
    const spinner = ora('Searching streaming link').start();

    const renderPage = async (url) => {
        if (attempt === 5) {
            spinner.fail('No link');
            spinner.stop();
            process.exit(0);
        }

        const instance = await phantom.create();
        const page = await instance.createPage();

        await page.open(url);

        const embed = await page.evaluate(() => {
            if (document.getElementById('player_frame')) {
                return document.getElementById('player_frame').innerHTML.replace(/&quot;/g, '"');
            }

            return null;
        });

        if (!embed) {
            attempt += 1;
            log(`Attempt ${attempt}`);
            await instance.exit();
            return await renderPage(url); // eslint-disable-line
        }

        await instance.exit();
        return embed;
    };

    const url = `http://vodlocker.to/embed?i=${id}`;
    const embed = await renderPage(url);
    const link = embed.match(/(((http[s]?|ftp):\/)?\/?([^:/\s]+)((\/\w+)*\/)([\w\-.]+[^#?\s]+)(.*)?(#[\w-]+)?)",/)[1];

    if (link) {
        spinner.succeed(`Your streaming link is here: ${link}`);
    } else {
        spinner.fail('No link');
    }

    spinner.stop();
})();
