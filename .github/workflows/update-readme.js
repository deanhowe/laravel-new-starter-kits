const fs = require('fs');
const https = require('https');

// Function to fetch package data from Packagist
async function getPackageData(repo) {
    return new Promise((resolve, reject) => {
        const url = `https://packagist.org/packages/${repo}.json`;
        console.log(`Fetching data for ${repo} from ${url}`);
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const packageData = JSON.parse(data);
                        console.log(`Successfully fetched data for ${repo}, installs: ${packageData.package.downloads.total}`);
                        resolve(packageData);
                    } else {
                        console.log(`Package not found for ${repo}, status code: ${res.statusCode}`);
                        // If package not found on Packagist, return null
                        resolve(null);
                    }
                } catch (e) {
                    console.error(`Error parsing data for ${repo}: ${e.message}`);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.error(`Error fetching data for ${repo}: ${e.message}`);
            resolve(null); // Resolve with null on error to continue processing
        });
    });
}

// Function to format install count with commas
function formatNumber(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
}

// Generate community starter kits list with sorting by installs
async function createCommunityLists(communityListArray) {
    const communityKits = [];
    for (const kit of communityListArray) {
        const packageData = await getPackageData(kit.package);
        // Ensure installs is a number for proper sorting
        const installs = packageData && packageData.package && packageData.package.downloads ?
            parseInt(packageData.package.downloads.total, 10) : 0;
        communityKits.push({
            title: kit.title,
            package: kit.package,
            repo: kit.repo,
            installs: installs
        });
        console.log(`Added community kit: ${kit.title}, package: ${kit.package}, repo: ${kit.repo}, installs: ${installs}`);
    }

    // Sort community kits by installs (descending)
    communityKits.sort((a, b) => b.installs - a.installs);
    console.log('Sorted community kits:', JSON.stringify(communityKits, null, 2));

    // Generate the formatted list
    let communityListString = '';
    for (const kit of communityKits) {
        communityListString += `- [${kit.title}](https://github.com/${kit.repo}) - \`\`\`${kit.package}\`\`\` <div class="snippet-clipboard-content notranslate position-relative overflow-auto" style="display: inline-flex;"><pre class="notranslate"><code style="padding:padding: var(--base-size-12);">laravel new my-app --using=${kit.package}</code></pre><div class="zeroclipboard-container"><clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w" value="laravel new my-app --using=laravel/vue-starter-kit" tabindex="0" role="button"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg></clipboard-copy></div></div> - 💾 ${formatNumber(kit.installs)} installs\n`;
        
        
    }

    return communityListString;
}

// Main function to update README
async function updateReadme() {
    // Read templates.json
    const templates = JSON.parse(fs.readFileSync('templates.json', 'utf8'));

    // Read README_template.md as the template
    let readme = fs.readFileSync('README_template.md', 'utf8');
    console.log('Original README_template.md content:', readme);

    // Verify the template has been read correctly
    if (!readme || readme.trim() === '') {
        throw new Error('README_template.md is empty or could not be read');
    }

    // Log the first line to verify it contains "laravel new starter"
    const firstLine = readme.split('\n')[0];
    console.log('First line of README_template.md:', firstLine);

    // Generate official starter kits list with sorting by installs
    const officialKits = [];
    for (const kit of templates.official) {
        const packageData = await getPackageData(kit.package);
        // Ensure installs is a number for proper sorting
        const installs = packageData && packageData.package && packageData.package.downloads ?
            parseInt(packageData.package.downloads.total, 10) : 0;
        officialKits.push({
            title: kit.title,
            package: kit.package,
            repo: kit.repo,
            installs: installs
        });
        console.log(`Added official kit: ${kit.title}, package: ${kit.package}, repo: ${kit.repo}, installs: ${installs}`);
    }

    // Sort official kits by installs (descending)
    officialKits.sort((a, b) => b.installs - a.installs);
    console.log('Sorted official kits:', JSON.stringify(officialKits, null, 2));

    // Generate the formatted list
    let officialList = '';
    for (const kit of officialKits) {
        officialList += `\n- [${kit.title}](https://github.com/${kit.repo}) - \`${kit.package}\` - 💿 ${formatNumber(kit.installs)} installs \n\n\`\`\`\nlaravel new my-app --using=${kit.package}\n\`\`\`\n`;
    }

    // Replace placeholders in README
    const communityListLivewire = await createCommunityLists(templates.community.livewire)
    const communityListReact = await createCommunityLists(templates.community.react)
    const communityListVue = await createCommunityLists(templates.community.vue)
    const communityListAPI = await createCommunityLists(templates.community.api)
    const communityListCMSOfficial = await createCommunityLists(templates.community.cms_official)
    const communityListCMSCommunity = await createCommunityLists(templates.community.cms_community)
    const communityListSAAS = await createCommunityLists(templates.community.saas)
    const communityListOther = await createCommunityLists(templates.community.other)

    console.log('Looking for placeholders in README_template...');
    console.log('README_template before replacement:', readme);

    // Use regex with global flag to ensure all occurrences are replaced
    readme = readme.replace(/\[OFFICIAL\]/g, officialList.trim());

    readme = readme.replace(/\[COMMUNITY_API\]/g, communityListAPI.trim());
    readme = readme.replace(/\[COMMUNITY_CMS_OFFICIAL\]/g, communityListCMSOfficial.trim());
    readme = readme.replace(/\[COMMUNITY_CMS_COMMUNITY\]/g, communityListCMSCommunity.trim());
    readme = readme.replace(/\[COMMUNITY_SAAS\]/g, communityListSAAS.trim());
    readme = readme.replace(/\[COMMUNITY_OTHER\]/g, communityListOther.trim());
    readme = readme.replace(/\[COMMUNITY_LIVEWIRE\]/g, communityListLivewire.trim());
    readme = readme.replace(/\[COMMUNITY_REACT\]/g, communityListReact.trim());
    readme = readme.replace(/\[COMMUNITY_VUE\]/g, communityListVue.trim());

    console.log('Generated README content (excerpt):', readme.substring(0, 500) + '...');
    console.log('Official list generated:', officialList);

    console.log('Livewire list generated:', communityListLivewire);
    console.log('React list generated:', communityListReact);
    console.log('Vue list generated:', communityListVue);
    console.log('API list generated:', communityListAPI);
    console.log('Official CMS list generated:', communityListCMSOfficial);
    console.log('Community CMS list generated:', communityListCMSCommunity);
    console.log('SASS list generated:', communityListSAAS);
    console.log('Misc. list generated:', communityListOther);

    // Write updated README
    fs.writeFileSync('README.md', readme);

    // Verify the README.md was written correctly
    const writtenReadme = fs.readFileSync('README.md', 'utf8');
    console.log('First line of written README.md:', writtenReadme.split('\n')[0]);

    if (writtenReadme !== readme) {
        console.warn('WARNING: Written README.md does not match the generated content');
    }

    console.log('README.md has been updated with starter kits from templates.json');
}

// Verify README_template.md exists before running
if (!fs.existsSync('README_template.md')) {
    console.error('ERROR: README_template.md does not exist');
    process.exit(1);
}

// Run the update
updateReadme().catch(err => {
    console.error('Error updating README:', err);
    process.exit(1);
});
