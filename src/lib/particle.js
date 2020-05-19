import { Vector3 } from 'three';

class Particle {
  constructor(initialPosition) {
    this.position = initialPosition.clone();
    this.previous = initialPosition.clone();
    this.original = initialPosition.clone();

    this.pinned = false;

    this.setupPhysics();
  }

  setMass(mass) {
    this.mass = mass;
    this.invMass = 1 / this.mass;
  }

  setPinned(pinned) {
    this.pinned = pinned;
  }

  setupPhysics() {
    this.drag = 0.97;
    this.acceleration = new Vector3(0, 0, 0);

    this.tmp = new Vector3();
    this.tmp2 = new Vector3();
  }

  addForce(force) {
    // this.tmp2.copy(force).multiplyScalar(this.invMass);
    this.tmp2.copy(force);
    this.acceleration.add(this.tmp2);
  }

  integrate(delta) {
    const newPos = this.tmp.subVectors(this.position, this.previous);
    newPos.multiplyScalar(this.drag).add(this.position);
    newPos.add(this.acceleration.multiplyScalar(delta * delta));

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.acceleration.set(0, 0, 0);
  }
}

export default Particle;
