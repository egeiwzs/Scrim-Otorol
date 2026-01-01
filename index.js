const { 
    Client, GatewayIntentBits, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, 
    ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, OAuth2Scopes, ChannelType
} = require('discord.js');

// --- BOT AYARLARI ---
const TOKEN = 'MTQ0MTgyMjcwNDQ2OTY3MTkzNg.GamA-f.nU3MUMLaf0NHsOZz-w_87XX3-xozBj6Pj3ci1s'; 
const PREFIX = '!'; 



const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ] 
});


const config = {
    roleChannel: null, 
    autoRole: null,   
    logChannel: null  
};

client.on('ready', () => {
    console.log(`Botunuz ${client.user.tag} olarak giriş yaptı!`);
    client.user.setActivity(`Cypher`);
    
    
    client.emit('clientReady');
});

// ayarla veya kurulum komutu
client.on('messageCreate', async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Ayarlama Menüsü Komutu
    if (command === 'ayarla' || command === 'kurulum') {
        // Yalnızca Yöneticilerin kullanabileceği kontrol
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ content: 'Bu komutu kullanmak için Yönetici yetkisine sahip olmalısınız.', ephemeral: true });
        }
        
    
        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('<:ayarlar:1433072180744159283> Oto Rol Sistemi Ayarları')
            .setDescription('Aşağıdaki ayarları yaparak oto rol sistemini kurabilirsiniz.')
            .addFields(
                { name: '<:destek:1435336073189396492> # Oto Rol Kanalı', value: `Bu menüden oto rol kanalını seçebilirsiniz. (Mevcut: ${config.roleChannel ? `<#${config.roleChannel}>` : 'Ayarlanmadı'})` },
                { name: '<:destek:1435336073189396492> Oto Rol Rolü', value: `Bu menüden oto rol rolünü seçebilirsiniz. (Mevcut: ${config.autoRole ? `<@&${config.autoRole}>` : 'Ayarlanmadı'})` },
                { name: '<:destek:1435336073189396492> # Oto Rol Log Kanalı', value: `Bu menüden oto rol log kanalını seçebilirsiniz. (Mevcut: ${config.logChannel ? `<#${config.logChannel}>` : 'Ayarlanmadı'})` }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('set_role_channel')
                    .setLabel('# Rol Kanalı Ayarla')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('set_auto_role')
                    .setLabel('Rol Ayarla')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('set_log_channel')
                    .setLabel('# Log Kanalı Ayarla')
                    .setStyle(ButtonStyle.Secondary)
            );

        const actionRowBottom = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('send_role_message')
                    .setLabel('Mesaj Gönder')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<:ek_komut:1433050499011182644>'),
                new ButtonBuilder()
                    .setCustomId('reset_system')
                    .setLabel('Sistemi Sıfırla')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('<:reload:1434519793330814998>'),
                new ButtonBuilder()
                    .setCustomId('delete_message') 
                    .setLabel('Ayarlama Mesajını Sil')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('<:clear:1434519939326152804>')
            );
        
        await message.channel.send({ 
            embeds: [embed], 
            components: [row, actionRowBottom]
        });
    }
});


client.on('interactionCreate', async interaction => {
   
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

  
    if (interaction.isButton() && interaction.customId !== 'get_team_role') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Bu özelliği kullanmak için Yönetici yetkisine sahip olmalısınız.', ephemeral: true });
        }
    }

 
    if (interaction.isButton()) {
        const customId = interaction.customId;

        if (customId === 'set_role_channel' || customId === 'set_auto_role' || customId === 'set_log_channel') {
            const modal = new ModalBuilder()
                .setCustomId(`modal_${customId}`)
                .setTitle('Ayar Değişikliği');

            let label, placeholder;
            if (customId === 'set_role_channel') {
                label = 'Kanal ID (Örn: 123456789012345678)';
                placeholder = 'Rol Kanalı ID\'sini girin';
            } else if (customId === 'set_auto_role') {
                label = 'Rol ID (Örn: 123456789012345678)';
                placeholder = 'Rol ID\'sini girin';
            } else if (customId === 'set_log_channel') {
                label = 'Log Kanalı ID (Örn: 123456789012345678)';
                placeholder = 'Log Kanalı ID\'sini girin';
            }

            const textInput = new TextInputBuilder()
                .setCustomId('input_id')
                .setLabel(label)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder(placeholder);

            const actionRow = new ActionRowBuilder().addComponents(textInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);

 
        } else if (customId === 'send_role_message') {
            if (!config.roleChannel || !config.autoRole) {
                return interaction.reply({ content: 'Lütfen **Rol Kanalı** ve **Rol** ayarlarını yapın.', ephemeral: true });
            }

            const botName = interaction.guild.members.cache.get(client.user.id).displayName;

            const roleEmbed = new EmbedBuilder()
                .setColor('#2F3136') 
                .setAuthor({ 
                    name: botName.toUpperCase(),
                  
                })
                .setDescription(
                    `**<@&${config.autoRole}>** Aşağıdaki <:yetkili_alim:1434518786316173333> **Rol Al** butonuna basıp takım ismini girdikten sonra rol alabilirsin.`
                )
               
                .setFooter({ 
                    text: 'Space Development | Oto Rol Sistemi' 
                }); 

            const roleRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('get_team_role')
                        .setLabel('Rol Al')
                        .setStyle(ButtonStyle.Secondary) 
                        .setEmoji('<:yetkili_alim:1434518786316173333>') 
                );
                
            const targetChannel = interaction.guild.channels.cache.get(config.roleChannel);
            if (targetChannel && targetChannel.type === ChannelType.GuildText) {
                await targetChannel.send({ embeds: [roleEmbed], components: [roleRow] });
                await interaction.update({ content: `Oto Rol mesajı <#${config.roleChannel}> kanalına gönderildi.`, embeds: [], components: [], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Belirtilen Rol Kanalı bulunamadı veya geçerli bir metin kanalı değil. Lütfen kontrol edin.', ephemeral: true });
            }

       
        } else if (customId === 'reset_system') {
            config.roleChannel = null;
            config.autoRole = null;
            config.logChannel = null;
            await interaction.update({ content: 'Sistem ayarları sıfırlandı.', embeds: [], components: [], ephemeral: true });

       
        } else if (customId === 'delete_message') {
            await interaction.message.delete().catch(() => {});
        }
    }


    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_')) {
        const customId = interaction.customId;
        const inputId = interaction.fields.getTextInputValue('input_id');

        if (!/^\d{17,19}$/.test(inputId)) {
            return interaction.reply({ content: 'Geçersiz ID formatı. Lütfen 17-19 haneli bir ID girin.', ephemeral: true });
        }

        if (customId === 'modal_set_role_channel') {
            config.roleChannel = inputId;
            await interaction.reply({ content: `Rol Kanalı ID: \`${inputId}\` olarak ayarlandı.`, ephemeral: true });
        } else if (customId === 'modal_set_auto_role') {
            config.autoRole = inputId;
            await interaction.reply({ content: `Rol ID: \`${inputId}\` olarak ayarlandı.`, ephemeral: true });
        } else if (customId === 'modal_set_log_channel') {
            config.logChannel = inputId;
            await interaction.reply({ content: `Log Kanalı ID: \`${inputId}\` olarak ayarlandı.`, ephemeral: true });
        }
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'get_team_role') return;

    const modal = new ModalBuilder()
        .setCustomId('team_name_modal')
        .setTitle('Takım İsmi Girişi');

    const teamNameInput = new TextInputBuilder()
        .setCustomId('team_name')
        .setLabel('Lütfen takım isminizi giriniz.')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Örn: Space Esports') 
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(teamNameInput);
    modal.addComponents(actionRow);

   
    try {
        await interaction.showModal(modal);
    } catch (e) {
        console.error("Modal gösterme hatası (Muhtemelen 3sn zaman aşımı):", e.code);
        
        return; 
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'team_name_modal') return;

    await interaction.deferReply({ ephemeral: true });
    const teamName = interaction.fields.getTextInputValue('team_name');
    
    if (!config.autoRole) {
        return interaction.editReply({ content: 'Oto Rol ayarlanmamış. Lütfen bot yöneticisine danışın.' });
    }

    const member = interaction.member;
    const guild = interaction.guild;
    const role = guild.roles.cache.get(config.autoRole);

    if (!role) {
        return interaction.editReply({ content: 'Ayarlanan rol sunucuda bulunamadı. Lütfen bot yöneticisine danışın.' });
    }
    
    try {
        await member.roles.add(role);
        
  
        const newNickname = `${teamName} | ${member.user.username}`; 
        await member.setNickname(newNickname).catch(e => {
            console.error('Kullanıcı ismi değiştirilemedi (Yetki eksik olabilir).', e);
        });

 
        const successEmbed = new EmbedBuilder()
            .setColor('#57F287') 
            .setAuthor({ name: 'Space Development Oto Rol' })
            .setTitle(`<:dogrulama:1433043175806603295> Rolün Verildi!`)
            .setDescription(`Sunucudaki ismin **${newNickname}** olarak düzenlendi ve **<@&${config.autoRole}>** rolü üzerine verildi.`)
            .setTimestamp();


        await interaction.editReply({ embeds: [successEmbed] });

      
        if (config.logChannel) {
            const logChannel = guild.channels.cache.get(config.logChannel);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('<:yetkili_alim:1434518786316173333> Yeni Rol Alan Kullanıcı')
                    .addFields(
                        { name: '<:detay:1433042452046020698> Kullanıcı', value: `${member.user.tag} (${member.id})`, inline: true },
                        { name: '<:detay:1433042452046020698> Aldığı Rol', value: `<@&${config.autoRole}>`, inline: true },
                        { name: '<:detay:1433042452046020698> Takım İsmi', value: teamName, inline: true },
                        { name: '<:detay:1433042452046020698> Yeni İsim', value: newNickname }
                    )
                    .setTimestamp();
                
                logChannel.send({ embeds: [logEmbed] });
            }
        }

    } catch (error) {
        console.error('Rol verme veya isim değiştirme hatası:', error);
        await interaction.editReply({ content: 'Bir hata oluştu. Rolün verilemedi. Lütfen botun rol yetkilerini kontrol edin.', ephemeral: true });
    }
});


client.login(TOKEN);