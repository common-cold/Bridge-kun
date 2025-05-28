import { base64 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as borsh from "borsh";


class BridgeEvent {
    event_type: string;
    source_address: string;
    polygon_address: string;
    amount: bigint

    constructor(
    event_type: string,
    source_address: string,
    polygon_address: string,
    amount: bigint
  ) {
    this.event_type = event_type;
    this.source_address = source_address;
    this.polygon_address = polygon_address;
    this.amount = amount;
  }
}

const schema: borsh.Schema = {
    struct: {
        event_type: 'String',
        source_address:  { array: { type: 'u8', len: 32 }},
        polygon_address: 'String',
        amount: 'u64'
    }
}



const res = "Zb1eU3aiYdwEAAAAQnVybg6Wf2S/iAnDdb1s8fnrnyCsEUFy0j7FIRjRUsP8lxWMKgAAADB4ZjM5N0E2RDIyRmQxQTM1ZjNlNTlDYjcyQzM1ZkYxYmYyMDJFYUUyYwAAAAAAAAAA";
const buffer = Buffer.from(res, "hex");
const obj = borsh.deserialize(schema, buffer);
console.log(obj);


