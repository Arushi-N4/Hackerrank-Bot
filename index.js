const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const userChoices = {};

client.on('ready',()=> {
    console.log(`🎉 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message)=> {
    if (message.author.bot) return;

    if (message.content==='!question') {
        const categories = [
            { label: 'SQL 🗃️', value: 'sql', description: 'Solve SQL challenges' },
            { label: 'Data Structures 🌳', value: 'data_structures', description: 'Practice data structure problems' }
        ];

        const categoryMenu = new StringSelectMenuBuilder()
            .setCustomId('select_category')
            .setPlaceholder('🔍 Choose a category')
            .addOptions(categories);

        const row = new ActionRowBuilder().addComponents(categoryMenu);
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🔹 Choose Your Category')
            .setDescription('Select a category you want to solve');

        await message.reply({ embeds: [embed], components: [row] });
    }
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const { customId, values, user } = interaction;

    if (customId === 'select_category') {
        const selectedCategory = values[0];
        userChoices[user.id] = { category: selectedCategory };

      
        const difficulties = [
            { label: 'Easy 🟢', value: 'easy', description: 'Beginner-friendly challenges' },
            { label: 'Medium 🟡', value: 'medium', description: 'Intermediate-level problems' },
            { label: 'Hard 🔴', value: 'hard', description: 'Expert-level challenges' }
        ];

        const difficultyMenu = new StringSelectMenuBuilder()
            .setCustomId('select_difficulty')
            .setPlaceholder('💪 Choose a difficulty level')
            .addOptions(difficulties);

        const row = new ActionRowBuilder().addComponents(difficultyMenu);

        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('🟦 Select Difficulty Level')
            .setDescription('Pick a difficulty level for your coding challenge.');

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    if (customId === 'select_difficulty') {
        const selectedDifficulty = values[0];
        const userChoice = userChoices[user.id];

        if (!userChoice) {
            await interaction.reply({ content: '⚠️ Please start with `!question` first.', ephemeral: true });
            return;
        }

        const category = userChoice.category;

        const filePath = path.join(__dirname, 'data', `${category}.json`);

        if (!fs.existsSync(filePath)) {
            await interaction.reply({ content: '❌ Error: Category data not found.', ephemeral: true });
            return;
        }

        const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'))[selectedDifficulty];

        if (!questions || questions.length === 0) {
            await interaction.reply({ content: '😔 No questions found for the selected difficulty.', ephemeral: true });
            return;
        }


        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`🚀 HackerRank Challenge - ${category.charAt(0).toUpperCase() + category.slice(1)} (${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)})`)
            .setDescription(randomQuestion.question)
            .setURL(randomQuestion.link);

        await interaction.reply({ embeds: [embed] });

        delete userChoices[user.id];
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
