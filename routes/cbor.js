var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var cardanoSerializationLib = require('@emurgo/cardano-serialization-lib-nodejs');


const chikara_policy_id = "86d8b8e14ebe621488c979ab9aa3901a7c177034fe6f6e553b97a1a8";


/* POST Cbor */ 

router.get('/:address/:balance', async function(req, res, next) {
    // console.log(req.params);
    const address = req.params.address;
    console.log(address);

    const addressBuffer = Buffer.from(address, 'hex');
    const addressFromBuffer = cardanoSerializationLib.Address.from_bytes(addressBuffer);
    const addressString = addressFromBuffer.to_bech32();
    const balance = req.params.balance;
    const balanceBuffer = Buffer.from(balance, 'hex');
    const balanceFromBuffer = cardanoSerializationLib.BigNum.from_bytes(balanceBuffer);
    const balanceString = balanceFromBuffer.to_str();
    const balanceInt = parseInt(balanceString, 10) / 1000000;

    const data = await getAsset(addressString);

    res.send({
        status: 'success',
        formatted: balanceInt,
        address: addressString,
        data: data
        });
});


async function getAsset(address){
  // address = 'addr1q88pcxafgze90uagat9x7vwhvd4e6seufkcr2m22jnzh0v8frp8s7snnqtw3n2z2lvsara3dd9c3v4u7n3t3nfrlmursg6hu82';
  try {
    console.log(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`);
    const res = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, {
      headers: {
        project_id: "mainnetBarCr4bVgOBTWDFhRsmwc3VNdpSlSARz",
        'Content-Type': 'application/json'
      }
    }).catch((error) => {
      console.log("error :>>", error);
      return { cnfts: [], cbalance: 0 }
    });

    const data = await res.json();
      // console.log("data :>>", data);
      if (data?.error) {
        console.log("error")
        return { cnfts: [], cbalance: 0 }
      }

      const amount = data['amount']
      // console.log("amount :>>", amount);
      let cnfts = [];
      let cnft_count = 0;
      let cbalance = 0;
      if (amount.length > 0) {
        for (const asset of amount) {
          console.log(asset.unit.includes(chikara_policy_id));
          if (asset.unit !== "lovelace" && asset.unit.includes(chikara_policy_id)) {
            const res1 = await fetch(
              `https://cardano-mainnet.blockfrost.io/api/v0/assets/${asset.unit}`,
              {
                headers: {
                  project_id: "mainnetBarCr4bVgOBTWDFhRsmwc3VNdpSlSARz",
                  'Content-Type': 'application/json'
                }
              }
            );

            const data1 = await res1.json();
            const meta = data1['onchain_metadata'];
            console.log('data1', data1);
            if (meta && meta.image) {
              console.log(meta);
              cnfts.push({ ...meta, assetId: data1.asset })
              cnft_count++
              // console.log({ ...meta, assetId: data1.asset })
              // console.log(cnft_count)

            }
          } else if (asset.unit === 'lovelace') {
            cbalance += asset.quantity
            // console.log(cbalance)

          }
        };
        console.log(cnfts)

      }

      return { cnfts, cbalance }
  } catch (error) {
    console.log("error :>>", error);
    return { cnfts: [], cbalance: 0 }
    
  }
}

module.exports = router;