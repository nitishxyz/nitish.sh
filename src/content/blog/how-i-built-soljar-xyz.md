---
title: "How I built soljar.xyz - A guide to building programs on Solana"
description: "A comprehensive guide to building Solana programs, using Soljar as a case study. Learn how to create a decentralized payments platform supporting SOL and SPL tokens, with detailed explanations of program structure, state management, and instruction implementation using Anchor."
pubDate: "Mar 29 2025"
---

# What is soljar

Soljar is a decentralized, on-chain payments platform built on Solana. It supports primary payment methods like USDC, USDT, and SOL, allowing you to accept stablecoins with the added option of accepting SOL. Soljar simplifies transactions by providing a user-friendly alternative to sharing your direct wallet address.

Creating an account on Soljar is straightforward: users connect their wallet and choose a username. This generates a unique Soljar link (e.g., `soljar.xyz/nitishxyz`) that can be shared instead of the actual wallet address. Anyone with a Solana wallet can use this link to pay you directly.

The payment page is _designed_ for versatility and ease of use. You can use browser extension wallets or scan the QR code on the page with your phone. Scanning the QR code opens the same payment page in Phantom via deep links, enabling convenient payments from your phone. This makes Soljar accessible and efficient for both desktop and mobile users.

# Why soljar?

Several questions arise: Why would someone with an existing wallet use Soljar? Why not just share a wallet address? What does Soljar offer that a wallet doesn't?

These are valid questions, so let's address them one by one.

Soljar offers a clean, modern interface that simplifies receiving payments and making withdrawals to personal wallets or direct off-ramps. The interface allows users to view their transaction history and see everyone who has sent them payments, along with the total amount received from each person. You can easily list all received payments, withdrawals, and clients. Common wallets often contain numerous transactions that are irrelevant to the average user, making payment tracking a mess. Anyone can send you unwanted tokens or spam your wallet. This cannot happen on Soljar, as we only display approved tokens.

Yes, you could share your wallet address, but that exposes you to spam and remains a hassle. I've personally experienced the doubt that arises when sending crypto using wallet addresses: even after copy-pasting the address, there's still a nagging worry about accuracy. Copying, pasting, and completing the payment flow is cumbersome. With Soljar, you simply click the link, connect your wallet, and pay—it's as easy as using a simple, human-readable username.

Soljar offers a clean, modern interface for managing and tracking your crypto finances, making your life easier while keeping everything secure and on-chain.

# Prerequisites

To start building programs on Solana, make sure you have the following:

- Proficiency in Rust: A strong understanding of Rust is essential for Solana development.
- Basic CLI Experience: Familiarity with command-line tools will help you navigate and manage your projects effectively.
- Modern Web Technologies: Knowledge of technologies like Next.js is beneficial for building decentralized applications (dApps).
- A Solana Wallet: You'll need a wallet extension such as Phantom or Solflare to interact with your programs.
- Motivation: A drive to learn and build is key to success in the Solana ecosystem.

# Initial Setup

To set up your local development environment, run the following command:

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

This command installs all the necessary tools for building Solana programs. After the installation is complete, you should see an output similar to the following:

```bash
Installed Versions:
Rust: rustc 1.85.0 (4d91de4e4 2025-02-17)
Solana CLI: solana-cli 2.1.14 (src:3ad46824; feat:3271415109, client:Agave)
Anchor CLI: anchor-cli 0.30.1
Node.js: v23.8.0
Yarn: 1.22.1
```

For more details, refer to the official Solana installation guide: [https://solana.com/docs/intro/installation](https://solana.com/docs/intro/installation)
Now, run the following command to view the basic configuration for the Solana CLI:

```bash
solana config get
```

It should display something similar to this:

```bash
Config File: /Users/nitishxyz/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /Users/nitishxyz/.config/solana/id.json
Commitment: confirmed
```

This is my configuration. Ensure you set the config to devnet. It's not critical since Anchor will have its own configuration set in the `Anchor.toml` file in the project ahead. However, we'll still use the Solana CLI later, so it's best to keep it set to devnet for now.

You can set your RPC URL to devnet using the following command:

```bash
solana config set --url devnet
```

Although for building and testing the program, we're going to use localnet, not even devnet. However, once we move to building the frontend part, we'll switch to devnet.

# Create Solana dApp

Okay, now that we've got the basics sorted, let's get started on building our project. To kick things off, use this command:

```bash
npx create-solana-dapp@latest
```

This command will walk you through setting up a new project with all the necessary files and configurations.

You'll be asked to enter a project name, pick a framework, and select a template. Here's how you should set them up:

```bash
┌  create-solana-dapp 4.2.7
│
◇  Enter project name
│  soljar
│
◇  Select a framework
│  Next.js
│
◇  Select a template
│  next-tailwind-counter
```

Once you confirm these settings, the tool will set up your project, install all the required dependencies, and update the template with your project name. This includes the initial setup for the frontend, like wallet connection.

We're using the counter application template because it saves us the hassle of manually changing the project name in multiple files. It's a bit more complete than the basic template, which makes our lives easier.

# Program Structure

By default, Anchor includes a `lib.rs` file in the `anchor/programs/soljar` directory. You _could_ cram your entire program into this one file, but as your project grows (and trust me, it will!), that single file can quickly become a tangled mess. Plus, with AI tools becoming more prevalent, smaller, more focused files are easier to manage and update.

Here's the program structure we'll end up with by the end of this tutorial:

```bash
⎿  anchor/programs/soljar
     ├── Cargo.toml
     ├── Xargo.toml
     └── src
         ├── constants.rs
         ├── error.rs
         ├── instructions
         │   ├── create_deposit.rs
         │   ├── create_spl_deposit.rs
         │   ├── create_supporter_index.rs
         │   ├── create_user.rs
         │   ├── create_withdrawl.rs
         │   ├── mod.rs
         │   └── withdraw_spl_tokens.rs
         ├── lib.rs
         ├── state
         │   ├── deposit.rs
         │   ├── jar.rs
         │   ├── mod.rs
         │   ├── supporter.rs
         │   ├── supporter_index.rs
         │   ├── tip_link.rs
         │   ├── treasury.rs
         │   ├── user.rs
         │   ├── user_by_name.rs
         │   └── withdrawl.rs
         └── utils.rs
```

A quick heads-up: some of the naming conventions might seem a bit quirky. I built this project in a whirlwind of 3-4 days, and in my excitement to get it live on mainnet, I didn't always have time to refactor names for maximum clarity. So, bear with me – some of them make sense, some... well, you'll see!

Initially, Soljar was built for receiving tips and sponsorships. Since then, it's been updated to serve as a broader payment interface, which explains some of the original naming conventions.

# Let's get building

With the project structure outlined in the previous section, you should now have a clear understanding of our setup. The `lib.rs` file serves as the main execution point for our program. Inside the `state` directory, we'll define the structures for various accounts like users, deposits, and withdrawals.

The `instruction` directory houses the logic for client-initiated actions. For example, `create_deposit.rs` will contain the code to create a new deposit account on the blockchain and handle the transfer of SOL or stablecoins.

Lastly, we have `error.rs`, `utils.rs`, and `constant.rs`, which contain helper functions and definitions to keep our program organized and efficient.

Make sure your `program/soljar` directory is set up as described, and let's start building.

# The Contract

The first step in building a dApp is writing a contract or program. A contract allows interaction with the blockchain, acting as the decentralized backend for your dApp. A contract consists of states and instructions.

A state is a struct that consists of data you might want to store in an on-chain account.
An instruction is the method executed when a call is made from the client as a transaction. Instructions are responsible for reading and writing states and making other blockchain calls.

# State Outline

Here's an outline of the structs required to manage the program's state:

1. **User:**
   - Stores user information.
   - Derived using the signer's key, ensuring one entry per wallet.
2. **User_by_name:**
   - _(Consider renaming to_ `*user_by_user*` _for clarity)_
   - Derived using the username, making it unique to both the username and the signer via a user PDA link.
3. **Jar:**
   - Tracks index and counts for deposits, withdrawals, and supporters.
   - Facilitates easy derivations and tracking.
4. **Tip_link:**
   - PDA for storing tip link information.
   - Stores the Jar address/Pubkey.
   - The tip link PDA can be easily derived using usernames, serving as the binding factor when a third party wants to send crypto to a user.
5. **Deposit:**
   - PDA for storing deposit information.
6. **Withdrawal:**
   - PDA for storing withdrawal information.
7. **Supporter:**
   - PDA for storing supporter information.
8. **Supporter_index:**
   - A special case to maintain one supporter PDA per supporter, and keep track of it.

# Instructions Outline

Here's the user journey for the entire project:

**1. User Signup and Wallet Connection**

- Users connect their wallets to sign up.

**2. Unique Username Creation**

- Each user creates a unique username.
- This username serves as an easily shareable link.

**3. Sharable Link Functionality**

- Sharing the link/username allows the contract to derive the user's jar address for receiving funds.
- A single instruction handles the creation of the user, jar, and tracker to prevent username duplication.
  - `create_user`

**4. Supported Tokens**

- Soljar supports SOL, USDC, and USDT.

**5. Deposit Instructions**

- Two instructions are used for deposits:
  - `create_deposit`
  - `create_spl_deposit`

**6. Payee Tracking**

- Track payees to populate the dashboard with data on how much each payee paid to the user.

**7. Withdrawal Instructions**

- Two instructions for withdrawals:
  - `create_withdrawal` for withdrawing SOL.
  - `withdraw_spl_tokens` for withdrawing USDC and USDT.

# create_user

To create a user in Soljar, we need to initialize four different states: `user`, `jar`, `user_by_name`, and `tip_link`. Each state is implemented as a Program Derived Address (PDA). Below are the definitions and seeds for each.

**1. User**

- **File**: `user.rs`
- **PDA Seeds**: `[b"user", signer.key().as_ref()]`

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub user: Pubkey,
    pub jar: Pubkey,
    #[max_len(15)]
    pub username: String,
    pub created_at: i64,
    pub updated_at: i64,
}
```

**2. Jar**

- **File**: `jar.rs`
- **PDA Seeds**: `[b"jar", signer.key().as_ref()]`

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Jar {
    pub user: Pubkey,
    pub deposit_count: u32,
    pub withdrawl_count: u32,
    pub supporter_count: u32,
    pub supporter_index: u32,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(25)]
    pub id: String,
    pub bump: u8,
}
```

**3. UserByName**

- **File**: `user_by_name.rs`
- **PDA Seeds**: `[b"username", username.as_bytes()]`

```rust
use anchor_lang::prelude::*;

#[account]
pub struct UserByName {
    pub username_taken: bool,
}

impl UserByName {
    pub const INIT_SPACE: usize = 1;
}
```

**4. TipLink**

- **File**: `tip_link.rs`
- **PDA Seeds**: `[b"tip_link", username.as_bytes()]`

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TipLink {
    pub user: Pubkey,
    pub jar: Pubkey,
}
```

You must have noticed that we're using rust macros before the struct, so let's dive a bit into that. The `#[account]` macro lets the program know that this struct is to be used as an account or a PDA.

`#[derive(InitSpace)]` is a macro that manages space calculation for the PDA automatically, so you don't have to write it manually when deriving the accounts in the instruction. This simplifies the process and reduces the risk of errors related to account sizing.

## Instruction: `create_user`

We define instructions using the following code structure:

```rust
pub fn create_user(ctx: Context<CreateUser>, username: String) -> Result<()> {
    Ok(())
}
```

The first argument is always the context, which informs the instruction about its operational environment, including derived accounts. Subsequent arguments, such as `username` in this case, represent data received from the client side.
All instructions in this tutorial will follow this structure.
Now, let's define `CreateUser` struct and the accounts required for the `create_user` instruction, deriving them using the seeds specified in the previous block.

```rust
#[derive(Accounts)]
#[instruction(username: String)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user: Box<Account<'info, User>>,

    #[account(
        init,
        payer = signer,
        space = 8 + UserByName::INIT_SPACE,
        seeds = [b"username", username.as_bytes()],
        bump
    )]
    pub user_by_name: Box<Account<'info, UserByName>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Jar::INIT_SPACE,
        seeds = [b"jar", signer.key().as_ref()],
        bump
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + TipLink::INIT_SPACE,
        seeds = [b"tip_link", username.as_bytes()],
        bump
    )]
    pub tip_link: Box<Account<'info, TipLink>>,

    system_program: Program<'info, System>,
}
```

To clarify a few key aspects of the account derivation above:

- `init`: This keyword initializes a new Program Derived Address (PDA) on the blockchain.
- `Accounts`: This attribute defines a PDA.
- `'info`: This denotes the lifetime of the instruction, ensuring data consistency during its execution.
- `payer`: This specifies the account (in this case, `signer`) that pays for the transaction and the PDA creation fee.
- `space`: Each account requires a certain amount of storage space on the blockchain. Here, we allocate the necessary space. We use `TipLink::INIT_SPACE` for convenience, as defined in the previous block. Without it, you'd have to manually calculate the required space (e.g., `8 + 32 + 32...`). The magic number `8` represents the discriminator, a required prefix at the beginning of each account.
- `seeds`: These are the seeds used to derive the PDA, both on the program and client sides.
- `bump`: The bump is a crucial component added to the seeds during PDA creation. It ensures that the resulting address is valid and not located on the Ed25519 curve, thus guaranteeing it's not a standard wallet keypair.

Now let's set the data in the PDAs that we just created, add following code to the instruction:

```rust
let user = &mut ctx.accounts.user;
    user.user = ctx.accounts.signer.key();
    user.username = username.clone();
    user.jar = ctx.accounts.jar.key();
    user.created_at = Clock::get()?.unix_timestamp;
    user.updated_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.user = ctx.accounts.user.key();
    jar.created_at = Clock::get()?.unix_timestamp;
    jar.updated_at = Clock::get()?.unix_timestamp;
    jar.id = username.clone();
    jar.bump = ctx.bumps.jar;

    let tip_link = &mut ctx.accounts.tip_link;
    tip_link.user = ctx.accounts.user.key();
    tip_link.jar = ctx.accounts.jar.key();

    let username_tracker = &mut ctx.accounts.user_by_name;
    username_tracker.username_taken = true;
```

And now we have an instruction built for creating a user, jar, tip_link, and ensuring username uniqueness through a dedicated tracker PDA user_by_name.

# Creating deposits with SOL (create_deposit instruction)

When a user wants to send SOL to another user on Soljar, they use the `create_deposit` instruction. This instruction handles the transfer of SOL from the sender to the recipient's jar and records details about the transaction.

## Deposit State Structure

First, let's define the `Deposit` struct that will store information about each deposit:

```rust
#[account]
#[derive(InitSpace)]
pub struct Deposit {
    pub signer: Pubkey,
    pub created_at: i64,
    pub amount: u64,
    #[max_len(15)]
    pub link_id: String,
    pub currency: u8,
    #[max_len(20)]
    pub memo: String,
}
```

This structure stores essential information about each deposit:

- `signer`: The public key of the user making the deposit
- `created_at`: Timestamp of when the deposit was created
- `amount`: The amount of SOL or SPL tokens being deposited
- `link_id`: The recipient's username
- `currency`: The currency being deposited (0 for SOL, 1 for USDC, 2 for USDT)
- `memo`: A message from the sender to the recipient

## CreateDeposit Context

```rust
#[derive(Accounts)]
#[instruction(tip_link_id: String)]
pub struct CreateDeposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_link", tip_link_id.as_bytes()],
        bump,
        has_one = jar,
    )]
    pub tip_link: Box<Account<'info, TipLink>>,

    #[account(mut)]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Deposit::INIT_SPACE,
        seeds = [b"deposit", jar.key().as_ref(), &jar.deposit_count.to_le_bytes()],
        bump,
    )]
    pub deposit: Box<Account<'info,Deposit>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", jar.key().as_ref(), &jar.supporter_index.to_le_bytes()],
        bump,
    )]
    pub supporter_index: Box<Account<'info, SupporterIndex>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Supporter::INIT_SPACE,
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub supporter: Box<Account<'info, Supporter>>,

    system_program: Program<'info, System>,
}
```

Let's break down the accounts:

- `signer`: The user making the deposit.
- `tip_link`: The PDA that links the username to the jar.
- `jar`: The recipient's jar PDA.
- `deposit`: A new PDA created to store the deposit information.
- `supporter_index`: PDA to manage supporters of a jar.
- `supporter`: PDA representing a supporter of a jar.
- `system_program`: Required for SOL transfers.

## Instruction Implementation

Now, let's implement the actual `create_deposit` instruction:

```rust
pub fn create_deposit(
    ctx: Context<CreateDeposit>,
    tip_link_id: String,
    referrer: String,
    memo: String,
    amount: u64,
) -> Result<()> {
    let currency: u8 = 0;

    if tip_link_id != tip_link_id.to_lowercase() {
        return Err(SoljarError::TipLinkIdMustBeLowercase.into());
    }

    let transfer_seed_ix = transfer(
        &ctx.accounts.signer.key(),
        ctx.accounts.jar.key(),
        amount,
    );

    invoke(
        &transfer_seed_ix,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.jar.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    let deposit = &mut ctx.accounts.deposit;
    deposit.signer = ctx.accounts.signer.key();
    deposit.currency = currency;
    deposit.link_id = ctx.accounts.tip_link.id.clone();
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.memo = memo;

    let jar = &mut ctx.accounts.jar;
    jar.deposit_count = jar
        .deposit_count
        .checked_add(1)
        .ok_or(SoljarError::DepositCountOverflow)?;
    jar.updated_at = Clock::get()?.unix_timestamp;

    Ok(())
}
```

In this implementation, we:

- Create a transfer instruction to move SOL from the signer to the jar.
- Execute the transfer using the system program.
- Update the newly created deposit PDA with all the transaction details.
- Increment the deposit count in the recipient's jar to track total deposits.
- Update the jar's last modified timestamp.

This instruction ensures that we not only transfer SOL between users but also maintain a persistent record of all transactions on the blockchain, making it easy to track payment history and build features like supporter recognition.

# SPL token deposits (create_spl_deposit instruction)

While SOL is the native currency of Solana, many users prefer to transact with stablecoins like USDC and USDT. The `create_spl_deposit` instruction enables Soljar users to deposit SPL tokens (Solana's equivalent of ERC-20 tokens) into a jar.

## SPL Token vs. SOL Transfers

SPL token transfers differ from SOL transfers in several key ways:

- They require interaction with the SPL Token program rather than the System program
- Token transfers require a source token account, a destination token account, and the token's mint
- The user needs to approve the transfer by signing the transaction

## CreateSplDeposit Context

Let's define the accounts required for an SPL token deposit:

```rust
#[derive(Accounts)]
#[instruction(tip_link_id: String)]
pub struct CreateSplDeposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"tip_link", tip_link_id.as_bytes()],
        bump,
        has_one = jar,
    )]
    pub tip_link: Box<Account<'info, TipLink>>,
    #[account(mut)]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Deposit::INIT_SPACE,
        seeds = [b"deposit", jar.key().as_ref(), &jar.deposit_count.to_le_bytes()],
        bump,
    )]
    pub deposit: Box<Account<'info,Deposit>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = signer,
        token::mint = mint,
        token::authority = jar,
        seeds = [b"token_account", jar.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = signer,
    )]
    pub source_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + SupporterIndex::INIT_SPACE,
        seeds = [b"supporter_index", jar.key().as_ref(), &jar.supporter_index.to_le_bytes()],
        bump,
    )]
    pub supporter_index: Box<Account<'info, SupporterIndex>>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Supporter::INIT_SPACE,
        seeds = [b"supporter", jar.key().as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub supporter: Box<Account<'info, Supporter>>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
}
```

Key points about the accounts:

- `mint`: The SPL token mint (e.g., USDC or USDT)
- `source_token_account`: The sender's token account for the specific token being sent
- `token_account`: The program-owned token account associated with the jar, which will receive the deposited tokens.
- `token_program`: Required for SPL token transfers
- Constraints are added to ensure that the token accounts match the specified mint and owners

## Instruction Implementation

Now, let's implement the `create_spl_deposit` instruction:

```rust
pub fn create_spl_deposit(
    ctx: Context<CreateSplDeposit>,
    tip_link_id: String,
    referrer: String,
    memo: String,
    amount: u64,
) -> Result<()> {
    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.source_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_cpi_accounts,
    );

    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    let deposit = &mut ctx.accounts.deposit;
    deposit.signer = ctx.accounts.signer.key();
    deposit.link_id = jar.id.clone();
    deposit.currency = currency;
    deposit.amount = amount;
    deposit.created_at = Clock::get()?.unix_timestamp;
    deposit.memo = memo;

   jar.deposit_count = jar.deposit_count.checked_add(1).ok_or(SoljarError::DepositCountOverflow)?;

   jar.updated_at = Clock::get()?.unix_timestamp;

  Ok(())
}
```

The implementation follows a similar pattern to the SOL deposit, but with these key differences:

- We use the token program's `transfer_checked` instruction instead of the system program's transfer instruction.
- We store the actual mint address of the token in the deposit record.
- We use token accounts rather than wallet addresses for the transfer.

## Benefits of Supporting SPL Tokens

By adding support for SPL tokens, Soljar becomes more versatile:

- Users can receive stablecoins like USDC and USDT
- Payments maintain a stable value regardless of SOL price fluctuations
- Integration with the broader Solana DeFi ecosystem becomes possible

This instruction completes the deposit functionality, allowing users to send both SOL and SPL tokens to any Soljar user by simply knowing their username.

# Supporter tracking system

The supporter tracking system in Soljar is a sophisticated mechanism designed to maintain records of who has sent payments to a particular jar and how much they've sent in each currency. This feature is crucial for the dashboard, allowing users to see all their supporters and the total amounts received from each.

## Supporter Structure

The supporter tracking system uses two main structures: Supporter and SupporterIndex.

First, let's look at the Supporter struct:

```rust
#[derive(AnchorDeserialize, AnchorSerialize, Clone, InitSpace)]
pub struct TipInfo {
    pub currency: u8,
    pub amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Supporter {
    pub signer: Pubkey,
    pub created_at: i64,
    pub tip_count: u16,
    pub tips: [TipInfo; 4],
    pub active_tips: u8,
}
```

This structure stores:

- signer: The public key of the supporter (the one sending payments)
- created_at: When this supporter first sent a payment
- tip_count: Total number of payments made by this supporter
- tips: An array of TipInfo objects that track the amount sent per currency
- active_tips: Number of different currencies this supporter has used

To efficiently track many supporters, Soljar also uses an indexing system:

```rust
#[account]
#[derive(InitSpace)]
pub struct SupporterIndex {
    pub total_items: u8,
    #[max_len(50)]
    pub supporters: Vec<Pubkey>,
}

impl SupporterIndex {
    pub const MAX_SUPPORTERS: u8 = 50;
}
```

This index tracks:

- total_items: The number of supporters in this index
- supporters: A vector of supporter public keys
- A maximum of 50 supporters per index page

## Supporter Tracking in Action

The actual supporter tracking logic is implemented in both the `create_deposit` and `create_spl_deposit` instructions. Here's the exact code from the create_deposit instruction that handles supporter tracking:

```rust
let supporter = &mut ctx.accounts.supporter;

  if supporter.signer == ctx.accounts.signer.key() {
      let mut found = false;

      for i in 0..supporter.active_tips as usize {
          if supporter.tips[i].currency == currency {
              supporter.tips[i].amount = supporter.tips[i].amount
                  .checked_add(amount)
                  .ok_or(SoljarError::AmountOverflow)?;
              supporter.tip_count = supporter.tip_count
                  .checked_add(1)
                  .ok_or(SoljarError::TipCountOverflow)?;
              found = true;
              break;
          }
      }

      if !found {
          require!(
              supporter.active_tips < 4,
              SoljarError::MaxCurrenciesReached
          );

          let idx = supporter.active_tips as usize;
          supporter.tips[idx] = TipInfo {
              currency,
              amount,
          };
          supporter.active_tips += 1;
          supporter.tip_count = supporter.tip_count
              .checked_add(1)
              .ok_or(SoljarError::TipCountOverflow)?;
      }
  } else {
      supporter.signer = ctx.accounts.signer.key();
      supporter.tip_count = 1;
      supporter.active_tips = 1;
      supporter.created_at = Clock::get()?.unix_timestamp;

      supporter.tips[0] = TipInfo {
          currency,
          amount,
      };
      for i in 1..4 {
          supporter.tips[i] = TipInfo {
              currency: 0,
              amount: 0,
          };
      }

      let jar = &mut ctx.accounts.jar;

      let supporter_index = &mut ctx.accounts.supporter_index;

      if supporter_index.total_items >= (SupporterIndex::MAX_SUPPORTERS - 1) as u8 {
          jar.supporter_index = jar.supporter_index
              .checked_add(1)
              .ok_or(SoljarError::PageOverflow)?;
      }

      supporter_index.total_items = supporter_index.total_items
          .checked_add(1)
          .ok_or(SoljarError::IndexOverflow)?;

      require!(
          supporter_index.supporters.len() < SupporterIndex::MAX_SUPPORTERS as usize,
          SoljarError::SupporterIndexFull
      );

      supporter_index.supporters.push(supporter.key());

      jar.supporter_count = jar.supporter_count.checked_add(1).ok_or(SoljarError::SupporterCountOverflow)?;
      jar.updated_at = Clock::get()?.unix_timestamp;
  }
```

The logic works as follows:

1. If the signer is already a known supporter:
   - If they've previously sent this currency, update the amount for that currency
   - If this is a new currency for them, add it to their list (up to 4 currencies)
   - Increment their tip count
2. If this is a new supporter:
   - Initialize their supporter record with the current payment
   - Zero out the unused currency slots
   - Add them to the supporter index
   - If the current supporter index is full, prepare to use the next page
   - Update the jar's supporter count

The same logic is mirrored in the `create_spl_deposit` instruction for SPL token deposits.
This sophisticated tracking system allows Soljar to maintain a complete record of all supporters and their contributions across different currencies, providing valuable insights to users about their payment sources.

# Withdrawal functionality

Soljar allows users to withdraw both native SOL and SPL tokens (like USDC and USDT) from their jars to their personal wallets. This functionality is essential for making the platform practical, as users need to be able to access the funds they've received.

## Withdrawl State

First, let's look at the state structure that tracks withdrawals:

```rust
#[account]
#[derive(InitSpace)]
pub struct Withdrawl {
    pub jar: Pubkey,
    pub currency: u8,
    pub amount: u64,
    pub created_at: i64,
}
```

This structure stores:

- jar: The jar PDA from which the withdrawal is made
- amount: The amount being withdrawn
- created_at: Timestamp of when the withdrawal was created
- currency: Numeric identifier for the currency (0 for SOL, 1 for USDC, 2 for USDT)

**_Note: The spelling "Withdrawl" (without the "a") is used throughout the codebase and is maintained for consistency._**

## CreateWithdrawl Struct

```rust
#[derive(Accounts)]
pub struct CreateWithdrawl<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, seeds = [b"jar", signer.key().as_ref()], bump)]
    pub jar: Account<'info, Jar>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + Withdrawl::INIT_SPACE,
        seeds = [b"withdrawl", jar.key().as_ref(), &jar.withdrawl_count.to_le_bytes()],
        bump,
    )]
    pub withdrawl: Account<'info, Withdrawl>,

    system_program: Program<'info, System>,
}
```

## SOL Withdrawal

For SOL withdrawals, the create_withdrawl instruction is used:

```rust
pub fn create_withdrawl(ctx: Context<CreateWithdrawl>, currency_mint: Pubkey, amount: u64) -> Result<()> {
      require!(amount > 0, SoljarError::InvalidAmount);
      let currency = get_currency_from_mint(currency_mint)?;

      if currency_mint == Pubkey::default() {
          msg!("TRANSFERING SOL");
          let jar_balance = ctx.accounts.jar.to_account_info().lamports();
          require!(jar_balance >= amount, SoljarError::InsufficientSolBalance);

          **ctx.accounts.jar.to_account_info().try_borrow_mut_lamports()? = jar_balance
              .checked_sub(amount)
              .ok_or(SoljarError::Overflow)?;

          let recipient_balance = ctx.accounts.signer.to_account_info().lamports();
          **ctx.accounts.signer.to_account_info().try_borrow_mut_lamports()? = recipient_balance
              .checked_add(amount)
              .ok_or(SoljarError::Overflow)?;
      }

      let withdrawl = &mut ctx.accounts.withdrawl;
      withdrawl.jar = ctx.accounts.jar.key();
      withdrawl.amount = amount;
      withdrawl.created_at = Clock::get()?.unix_timestamp;
      withdrawl.currency = currency;

      let jar = &mut ctx.accounts.jar;
      jar.withdrawl_count = jar.withdrawl_count.checked_add(1).ok_or(SoljarError::WithdrawlCountOverflow)?;
      jar.updated_at = Clock::get()?.unix_timestamp;

      Ok(())
}
```

For SOL withdrawals, the process involves:

- Verifying that the withdrawal amount is valid (greater than 0)
- Checking if the jar has enough balance for the withdrawal
- Directly transferring SOL from the jar to the user's wallet using lamports
- Recording the withdrawal details and updating the withdrawal count

## SPL Token Withdrawal

For withdrawing SPL tokens like USDC and USDT, the withdraw_spl_tokens instruction is used:

**WithdrawSplTokens Struct**

```rust
#[derive(Accounts)]
pub struct WithdrawSplTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"jar", signer.key().as_ref()],
        bump,
    )]
    pub jar: Box<Account<'info, Jar>>,

    #[account(
        init,
        payer = signer,
        space = 8 + Withdrawl::INIT_SPACE,
        seeds = [b"withdrawl", jar.key().as_ref(), &jar.withdrawl_count.to_le_bytes()],
        bump,
    )]
    pub withdrawl: Box<Account<'info, Withdrawl>>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = jar,
        seeds = [b"token_account", jar.key().as_ref(), mint.key().as_ref()],
        bump,
    )]
    pub token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub associated_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    system_program: Program<'info, System>,
    token_program: Interface<'info, TokenInterface>,
    associated_token_program: Program<'info, AssociatedToken>,
}
```

Key aspects of this account structure:

- jar: The user's jar, derived using their wallet key
- token_account: The jar's token account for the specific token being withdrawn
- associated_token_account: The user's associated token account that will receive the tokens
- We initialize the user's token account if it doesn't exist yet
- We use the jar as the signer for the token transfer using PDA signing

**Instruction**

```rust
pub fn withdraw_spl_tokens(ctx: Context<WithdrawSplTokens>, amount: u64) -> Result<()> {
    require!(amount > 0, SoljarError::InvalidAmount);
    let currency = get_currency_from_mint(ctx.accounts.mint.key())?;

    let mint = ctx.accounts.mint.key();
    msg!("Mint: {}", mint);
    if mint == Pubkey::default() {
        return Ok(());
    }

    require!(
        ctx.accounts.token_account.amount >= amount,
        SoljarError::InsufficientTokenBalance
    );

    require!(
        ctx.accounts.token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );
    require!(
        ctx.accounts.associated_token_account.mint == ctx.accounts.mint.key(),
        SoljarError::InvalidTokenMint
    );

    let transfer_cpi_accounts = TransferChecked {
        from: ctx.accounts.token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.associated_token_account.to_account_info(),
        authority: ctx.accounts.jar.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();

    let user_key = ctx.accounts.signer.key();
    let jar_bump = ctx.accounts.jar.bump;

    msg!("User key: {}", user_key);
    msg!("Jar bump: {}", jar_bump);
    msg!("Expected jar address: {}", ctx.accounts.jar.key());

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"jar",
        user_key.as_ref(),
        &[jar_bump],
    ]];

    let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts)
        .with_signer(signer_seeds);

    transfer_checked(cpi_context, amount, ctx.accounts.mint.decimals)?;

    let withdrawl = &mut ctx.accounts.withdrawl;
    withdrawl.jar = ctx.accounts.jar.key();
    withdrawl.amount = amount;
    withdrawl.currency = currency;
    withdrawl.created_at = Clock::get()?.unix_timestamp;

    let jar = &mut ctx.accounts.jar;
    jar.withdrawl_count = jar.withdrawl_count.checked_add(1).unwrap();
    jar.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}
```

The SPL token withdrawal process:

- Validates the withdrawal amount and currency
- Ensures there's enough token balance in the jar's token account
- Verifies that all token accounts belong to the correct mint
- Transfers tokens from the jar's token account to the user's associated token account
- Signs the transaction using the jar's PDA (Program Derived Address) as the authority
- Records the withdrawal and updates the count

Security Considerations
The withdrawal functionality includes several important security features:

- Only the jar owner can withdraw funds (enforced by the seeds in the jar account derivation)
- Proper balance checks ensure users can't withdraw more than they have
- Transaction signing uses the jar's PDA, providing authority without exposing private keys
- All withdrawals are recorded on-chain for transparency and auditability

These two withdrawal instructions, combined with the deposit functionality, complete the core payment flow of Soljar, allowing users to receive, hold, and withdraw both SOL and SPL tokens in a secure and traceable manner.

# Testing the Program

Testing is a critical part of developing any Solana program. For Soljar, we use a comprehensive testing approach that simulates the entire user journey from account creation to deposits and withdrawals. Let's look at how the tests are structured and the tools used.

## Testing Framework and Tools

Soljar tests use several key tools:

- Anchor Bankrun: Rather than connecting to a real Solana network, we use Solana's "bankrun" for testing. This is a local simulation environment that allows fast, deterministic testing without needing to connect to a live network.
- Jest: We use Jest as the test runner and assertion library, which provides a clean syntax for writing and organizing tests.
- Custom Test Context: A shared test context is maintained across all test files, allowing tests to build upon the state created by previous tests.

## Test Structure

The tests are organized to follow a complete user journey through the application:

```ts
describe("Soljar Program Tests", () => {
  beforeAll(async () => {
    const context = await initializeTestContext();
    setTestContext(context);
  });

  require("./specs/user.create.spec");
  require("./specs/deposit.create.spec");
  require("./specs/withdrawl.create.spec");
  require("./specs/stress.spec");
});
```

This structure is intentional - tests run in a specific order that mimics real user flows:

- First, users are created
- Then, deposits are made to those users
- Next, withdrawals are tested
- Finally, stress tests verify the system works under load

## Initialization and Setup

Before running tests, a test context is initialized with everything needed:

```ts
export async function initializeTestContext(): Promise<TestContext> {
  const newMember = new anchor.web3.Keypair();
  const members: Keypair[] = Array(19)
    .fill(0)
    .map(() => new anchor.web3.Keypair());

  const mint = await createMint(
    banksClient,
    creator,
    creator.publicKey,
    null,
    2
  );

  creatorTokenAccount = await createAssociatedTokenAccount(
    banksClient,
    creator,
    mint,
    creator.publicKey,
    TOKEN_PROGRAM_ID
  );

  await mintTo(
    banksClient,
    creator,
    mint,
    creatorTokenAccount,
    creator,
    1000000000000
  );

  return {
    context,
    provider,
    program,
    banksClient,
    newMember,
    creator,
    mint,
    creatorTokenAccount,
  };
}
```

This initialization:

- Creates multiple test keypairs (wallets)
- Sets up token mints to test SPL token functionality
- Creates associated token accounts for all test users
- Mints test tokens to each account

## Example Test: Creating a User

Here's how the user creation test is implemented:

```ts
describe("1. User Creation", () => {
  it("should create a new user", async () => {
    const { program, creator } = getTestContext();
    const username = "satoshi";
    const userPDA = findUserPDA(creator.publicKey);
    const jarPDA = findJarPDA(creator.publicKey);
    const userByNamePDA = findUserNamePDA(username);
    const supporterIndexPDA = findSupporterIndexPDA(jarPDA, 0);

    await program.methods
      .createUser(username)
      .accounts({})
      .postInstructions([
        await program.methods
          .createSupporterIndex(0)
          .accounts({})
          .instruction(),
      ])
      .signers([creator])
      .rpc();

    const user = await program.account.user.fetch(userPDA);
    expect(user.username).toBe(username);
    expect(user.user.equals(creator.publicKey)).toBe(true);

    const userByName = await program.account.userByName.fetch(userByNamePDA);
    expect(userByName.usernameTaken).toBe(true);
  });

  it("should fail with username too long", async () => {
    // Test implementation...
  });
});
```

This test:

1. Uses helper functions to derive the expected PDAs
2. Sends a transaction to create a user with the username "satoshi"
3. Uses postInstructions to also create a supporter index in the same transaction
4. Fetches and verifies the created accounts match the expected values
5. Is followed by negative test cases that verify the program properly rejects invalid input

## Testing the Complete Flow

The test suites run in order, with each building upon the state created by previous tests:

1. User Creation Tests: Create users and verify they're properly stored
2. Deposit Tests: Send SOL and SPL tokens to users and verify balances and supporter tracking
3. Withdrawal Tests: Test withdrawing funds and verify balances update correctly
4. Stress Tests: Verify the system handles multiple users and transactions

## Benefits of This Testing Approach

This organized testing approach offers several benefits:

1. Comprehensive Coverage: Tests cover the entire user journey
2. State Persistence: Using a shared context lets tests build on previous states
3. Fast Execution: Bankrun tests run very quickly compared to testing on a live network
4. Deterministic Results: The local simulation environment ensures consistent results
5. Negative Testing: We explicitly test error cases to ensure proper validation

By thoroughly testing each instruction and its edge cases, we gain confidence that the Soljar program works correctly and securely before deploying it to a live network.

# Project Resources

- Complete Program Code: The full source code for Soljar is available on GitHub at https://github.com/soljar-xyz/soljar
  - Mainnet Deployment: Soljar is deployed on Solana mainnet with the program ID: JARSq9S9RgyynuAwcdWh2yEG6MbhfntWq7zjXjAo87uQ
  - Live Application: The application is live and can be accessed at https://soljar.xyz

## Technical Details

Anchor Version: This project was originally created with Anchor version 0.30.1 and has since been upgraded to 0.31.0

Important Considerations:

- The newer Anchor version (0.31.0) allows more accounts to be derived in a single instruction
- The instructions in this codebase are broken up as they were written for 0.30.1
- If you encounter any errors or conflicts, be sure to add bytemuck_derive = "=1.8.1" in the dependencies section of your Cargo.toml file

Feel free to explore the live application, create your own Soljar account, and examine the on-chain transactions to see how the program works in production. The GitHub repository contains the complete codebase covered in this tutorial, along with additional components not discussed here.
