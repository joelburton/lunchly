const express = require("express");
const { Customer, Reservation } = require("./models");

router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.all();
  res.render("customer_list.html", { customers })
});

router.get("/add/", async (req, res) => {
  res.render("customer_new_form.html");
})

router.post("/add/", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save()

    return res.redirect(`/${customer.id}/`);
  } catch (e) {
    return res.status(500).send(`Can't add customer: ${e}`);
  }
});

router.get("/:customerId/", async (req, res) => {
  try {
    const customer = await Customer.get(req.params.customerId);
    const reservations = await customer.getReservations();
    return res.render("customer_detail.html", { customer, reservations })
  } catch (e) {
    return res.status(500).send(`Can't get customer: ${e}`);
  }
});

router.get("/:customerId/edit/", async (req, res) => {
  try {
    const customer = await Customer.get(req.params.customerId);
    res.render("customer_edit_form.html", { customer });
  } catch (e) {
    return res.status(500).send(`Can't get customer: ${e}`);
  }
});

router.post("/:customerId/edit/", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phone = req.body.phone;
  const notes = req.body.notes;

  try {
    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save()

    return res.redirect(`/${customer.id}/`);
  } catch (e) {
    return res.status(500).send(`Can't edit customer: ${e}`);
  }
});

router.post("/:customerId/add-reservation/", async (req, res) => {
  const customerId = req.params.customerId;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  try {
    const reservation = new Reservation({ customerId, startAt, numGuests, notes });
    reservation.save();

    return res.redirect(`/${customerId}/`);
  } catch (e) {
    return res.status(500).send(`Can't create reservation: ${e}`);
  }
});

module.exports = router;