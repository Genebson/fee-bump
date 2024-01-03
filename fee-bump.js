import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

(async () => {
  const sourceKeypair = Keypair.fromSecret(
    "SAC4R57TC5MUT5U77WE5BB2RAM6XU5QVLQBIIY4YU3EP2SJPEDGZRQ3F"
  );
  const destinationKeypair = Keypair.fromSecret(
    "SCQ5DB7BBEXBZQVOUEID7LLILJGOVXSNH2YOJIWQYR6XMMXBM43LYVHZ"
  );
  const feeKeypair = Keypair.fromSecret(
    "SC73C2LSEHM2PPJ22E66PVCXZYIA36XISHWXIA5W5OAW2ITLB5OBR47H"
  );

  const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

  const innerTransaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        amount: "200",
        asset: Asset.native(),
        destination: destinationKeypair.publicKey(),
      })
    )
    .setTimeout(30)
    .build();

  innerTransaction.sign(sourceKeypair);

  console.log("Inner transaction has been signed correctly");

  const feeBumpTransaction = new TransactionBuilder.buildFeeBumpTransaction(
    feeKeypair,
    BASE_FEE,
    innerTransaction,
    Networks.TESTNET
  );

  feeBumpTransaction.sign(feeKeypair);

  console.log("Fee bump transaction has been signed correctly");

  try {
    const submit = await server.submitTransaction(feeBumpTransaction);
    console.log(`Submitted transaction: ${submit.result_xdr}`);
  } catch (error) {
    console.error(error);
  }
})();
