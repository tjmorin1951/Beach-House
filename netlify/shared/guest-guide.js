// Guest Tips and Guidelines — edit the text below to change what guests receive.

const H = 'font-family:Georgia,serif;font-size:15px;color:#1B4965;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #E5D4B5;';
const P = 'font-family:Arial,sans-serif;font-size:14px;line-height:1.5;margin:0 0 9px;';
const BOX = 'font-family:Arial,sans-serif;font-size:13px;line-height:1.5;background:#FBF6EE;border:1px solid #E5D4B5;border-radius:12px;padding:14px;margin:14px 0;';
const ALERT = 'font-family:Arial,sans-serif;font-size:13px;line-height:1.5;background:#FDF3EF;border:1px solid #C8553D40;border-radius:12px;padding:14px;margin:14px 0;';

export const GUEST_GUIDE_HTML = `
  <p style="${P}font-style:italic;">Thank you for helping us keep the home safe, comfortable, and well cared for.</p>

  <div style="${ALERT}">
    <strong style="color:#C8553D;">Report leaks or damage immediately</strong><br>
    John: (413) 531-7685<br>
    Marti: (413) 575-6751
  </div>

  <h3 style="${H}">Safety First</h3>
  <p style="${P}"><strong>No smoking.</strong> Smoking is not permitted anywhere on the property.</p>
  <p style="${P}"><strong>Wind and doors.</strong> Opening the front and back doors at the same time creates a powerful air current and can slam the doors with great force &mdash; enough to injure someone, especially a young child. Children should not manage exterior doors alone.</p>
  <p style="${P}"><strong>Children.</strong> Children must be accompanied by a responsible adult on the roof deck and supervised in the pool. The roof-deck door is heavy and can be pulled unexpectedly by the wind.</p>
  <p style="${P}"><strong>Elevator.</strong> Always close the inside accordion gate completely when entering and leaving. The elevator may lock if the inner gate is left open more than an hour. Children may not ride alone or operate it. Follow the posted instructions and keep your phone with you in case of a malfunction.</p>
  <p style="${P}"><strong>Roof-deck hurricane door.</strong> Roll it completely down on rainy days and before departure.</p>

  <div style="${ALERT}">
    <strong style="color:#C8553D;">Dune and sea turtle protection</strong><br>
    The Town of Topsail strictly protects the dunes and sea turtles, particularly May through October. Stay on marked paths, do not walk on the dunes, and use trash bins. At nightfall, turn off all exterior lights unless they have amber bulbs &mdash; bright lights confuse nesting turtles. Violations may result in fines of up to $10,000.
  </div>

  <h3 style="${H}">Emergency Shutoffs</h3>
  <p style="${P}"><strong>Water.</strong> Storage room in the garage, back-right corner near the side door. Turn the <strong>white</strong> valve to shut off.</p>
  <p style="${P}"><strong>Gas.</strong> Outside, just beyond the garage side door, under the equipment platform. Turn the <strong>blue</strong> valve to shut off.</p>

  <h3 style="${H}">Home Care &amp; Comfort</h3>
  <p style="${P}"><strong>HVAC.</strong> Don't run the heating or cooling with doors open. Adjust the thermostat only a few degrees at a time to avoid freezing the system.</p>
  <p style="${P}"><strong>Shoes.</strong> Remove sandy or wet shoes before entering. Use the outdoor shower or hose to rinse off sand.</p>
  <p style="${P}"><strong>Shells and collectables.</strong> Please don't bring sandy shells, rocks, or sea glass inside unless they've been rinsed and are sand free.</p>
  <p style="${P}"><strong>Wet towels and clothing.</strong> Don't drape wet items over furniture &mdash; use a laundry room or the available hooks.</p>
  <p style="${P}"><strong>Laundry rooms.</strong> There's one on each living/sleeping floor, and detergent is provided. Leave each washer door <strong>open</strong> when not in use to prevent trapped moisture, mold, and mildew.</p>
  <p style="${P}"><strong>Food and drinks.</strong> Use coasters on all tabletops and wood surfaces &mdash; they're in the kitchen drawer with the paper towels. Please keep food in the kitchen, at the dining table, or on the patios, and take extra care with anything other than water.</p>
  <p style="${P}"><strong>Fireplace.</strong> Two switches sit to the right of the fireplace. The <strong>left</strong> switch must stay on at all times. Use only the <strong>right</strong> switch to turn the flames on and off.</p>
  <p style="${P}"><strong>Microwave.</strong> Open and close the kitchen microwave using the push button, not by hand.</p>
  <p style="${P}"><strong>Kitchen outlets.</strong> The child-protected outlets can be stiff. They work fine, but the plug may need to go in at the right angle.</p>

  <h3 style="${H}">Beach, Pool &amp; Outdoor</h3>
  <p style="${P}"><strong>Beach towels.</strong> On the rack to the left of the door leading to the pool and beach. Please use these instead of bath towels.</p>
  <p style="${P}"><strong>Beach gear.</strong> Chairs, umbrellas, and boogie boards are in the garage, garage closet, and lower-level inside closet. Rinse each item, let it dry, and return it where you found it.</p>
  <p style="${P}"><strong>Ticks.</strong> Check everyone for ticks after time outdoors &mdash; they're common in the dunes and on local wildlife.</p>

  <h3 style="${H}">Trash, Recycling &amp; Cleaning</h3>
  <p style="${P}"><strong>Where.</strong> Place bins at the road in front of the house, between the mailbox and driveway. Put them out the night before whenever possible.</p>
  <p style="${P}"><strong>When.</strong> April through October: Wednesday and Saturday. November through March: Wednesday only.</p>
  <p style="${P}"><strong>Recycling.</strong> Do not bag recyclables &mdash; the service won't empty the bin if bagged items are inside. Bins are clearly marked.</p>
  <p style="${P}"><strong>Cleaning supplies.</strong> A vacuum is in the front hallway on each living floor. Broom and Swiffer mop are behind the door in the top-floor laundry room; a broom, iron, and ironing board are in the second-floor laundry room.</p>

  <div style="${BOX}">
    <strong>Pet policy.</strong> <strong>Pet policy.</strong> Sorry, no pets allowed on the property.
  </div>

  <h3 style="${H}">Before You Go</h3>
  <p style="${P}">Before the last guest leaves, please:</p>
  <p style="${P}">&#9744;&nbsp; Strip the beds, wash the sheets and towels, and remake the beds.<br>
  &#9744;&nbsp; Empty every indoor trash and recycling container.<br>
  &#9744;&nbsp; Place recyclables loose in the bin &mdash; do not bag them.<br>
  &#9744;&nbsp; Load all dirty dishes in the dishwasher and run it. Put dishes away when possible.<br>
  &#9744;&nbsp; Rinse, dry, and return beach chairs, umbrellas, boogie boards, and other gear.<br>
  &#9744;&nbsp; Leave washer doors open.<br>
  &#9744;&nbsp; Roll the roof-deck hurricane door completely down.<br>
  &#9744;&nbsp; Lock the garage and check that the slider is secure.</p>

  <div style="${BOX}">
    <<strong>Thank you</strong> &mdash; we appreciate your help keeping Uncle John's Beach House safe and ready for the next guests.
  </div>
`;
