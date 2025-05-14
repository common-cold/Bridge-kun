use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_2022::Token2022, token_interface::{Mint, TokenAccount}};
use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::variable_len_pack::VariableLenPack;
use anchor_lang::{solana_program::rent::{DEFAULT_EXEMPTION_THRESHOLD, DEFAULT_LAMPORTS_PER_BYTE_YEAR}, system_program::{transfer, Transfer}};
use anchor_spl::token_interface::{token_metadata_initialize, TokenMetadataInitialize, MintTo, mint_to};



declare_id!("G3dDgLNsvXbwk3VEwdaJ48Ju7Cruk3M9Xk3kQwhAZKht");

#[program]
pub mod bridge {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    #[derive(Accounts)]
    pub struct Initialize {}


    pub fn create_token_mint(ctx: Context<CreateTokenMint>) -> Result<()> {
        // let TokenMetadataParams {name, symbol} = args;
        let name = String::from("BNFSCOIN");
        let symbol = String::from("BNFS");
        
        let token_metadata = TokenMetadata {
            name: name.clone(),
            symbol: symbol.clone(),
            uri: String::from(""),
            ..Default::default()
        };

        // calculate rent exempt
        let data_len = 4 + token_metadata.get_packed_len()?;
        let lamports = data_len as u64  * DEFAULT_LAMPORTS_PER_BYTE_YEAR * DEFAULT_EXEMPTION_THRESHOLD as u64;

        
        //cpi into system program to send rent exempt to mint_account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: ctx.accounts.mint_account.to_account_info()
            }
        );
        transfer(cpi_context, lamports)?;

        //initialize token metadata 
        let token_metadata_cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenMetadataInitialize {
                program_id: ctx.accounts.token_program.to_account_info(),
                metadata: ctx.accounts.mint_account.to_account_info(),
                update_authority: ctx.accounts.signer.to_account_info(),
                mint_authority: ctx.accounts.signer.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info()
            }
        );
        token_metadata_initialize(
            token_metadata_cpi_ctx,
            name, 
            symbol, 
            String::from("")
        )?;

        msg!("Mint Account: {:?}", ctx.accounts.mint_account);
        Ok(())
    }

    
    pub fn deposited_on_opposite_chain(ctx: Context<DepositedOnOppositeChain>, amount: u64) -> Result<()> {
        ctx.accounts.user_balance_account.balance += amount;
        Ok(())
    }

    pub fn create_associated_token_account(ctx: Context<CreateAta>) -> Result<()> {
        msg!("Associated Account: {:?}", ctx.accounts.associated_token_account);
        msg!("Mint Account: {:?}", ctx.accounts.mint_account);
        Ok(())
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info()
            }
        );
        mint_to(cpi_context, amount)?;
        Ok(())
    }
 

}


#[derive(Accounts)]
pub struct CreateTokenMint<'info> {

    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        init,
        payer = signer,
        mint::decimals = 9,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
        extensions::metadata_pointer::authority = signer.key(),
        extensions::metadata_pointer::metadata_address = mint_account
    )]
    pub mint_account: InterfaceAccount<'info, Mint>,
    
    pub token_program: Program<'info, Token2022>,
    
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct DepositedOnOppositeChain<'info> {
    
    #[account(mut)]
    pub signer: Signer<'info>,

    pub user_account: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserBalance::INIT_SPACE,
        seeds = [b"balance".as_ref(), user_account.key().as_ref()],
        bump
    )]
    pub user_balance_account: Account<'info, UserBalance>,

    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct CreateAta<'info> {
    
    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint_account: InterfaceAccount<'info, Mint>,
    
    #[account(
        init,
        payer = signer,
        associated_token::mint = mint_account,
        associated_token::authority = signer,
        associated_token::token_program = token_program
    )]
    pub associated_token_account: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>
}


#[derive(Accounts)]
pub struct MintToken<'info> {
    
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub associated_token_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>
}


#[account]
#[derive(InitSpace)]
pub struct UserBalance {
    pub balance: u64
}


// #[derive(AnchorSerialize, AnchorDeserialize)]
// pub struct TokenMetadataParams {
//     pub name: String,
//     pub symbol: String   //"BNFSCOIN", "BNFS
// }