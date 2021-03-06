const pg = require("pg");
const moment = require("moment")

const db = new pg.Client("postgresql://localhost/lunchly");
db.connect();


class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  set startAt(val) {
    if (val instanceof Date && !isNaN(val)) this._startAt = val;
    else throw new Error("Not a valid startAt.");
  }

  get startAt() { return this._startAt; }

  get formattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  set notes(val) {
    this._notes = val || '';
  }

  get notes() { return this._notes; }

  set customerId(val) {
    if (this._customerId && this._customerId !== val) throw new Error("Cannot change customer ID");
    this._customerId = val;
  }

  get customerId() { return this._customerId }

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  static async get(id) {
    const result = await db.query(
      `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt",
           notes
         FROM reservations 
         WHERE id = $1`,
      [id]
    );

    return new Reservation(results.row[0]);
  }
}

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  set notes(val) {
    this._notes = val || '';
  }

  get notes() { return this._notes; }

  set phone(val) {
    this._phone = val || null;
  }

  get phone() { return this._phone; }

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );
    return new Customer(results.rows[0]);
  }

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]);
      console.log("result", result.rows[0].id);
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4)
           WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]);
    }
  }
}

module.exports = { Customer, Reservation };