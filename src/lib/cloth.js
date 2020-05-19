import { Vector3 } from 'three';

import Particle from './particle';

class Cloth {
  constructor(xSegments, ySegments, distance) {
    this.xSegments = xSegments || 10;
    this.ySegments = ySegments || 10;
    this.distance = distance || 25;
    this.windEnabled = true;

    this.setupPhysics();
    this.createGeometryFunction();
    this.createParticles();
    this.createConstraints();
  }

  setupPhysics() {
    const GRAVITY = 9.81;
    this.mass = 50;
    this.gravityForce = new Vector3(0, -GRAVITY, 0).multiplyScalar(this.mass);

    this.windStrength = 40;
    this.windForce = new Vector3();

    this.tmpForce = new Vector3();
    this.diff = new Vector3();
  }

  createGeometryFunction() {
    const { xSegments, ySegments, distance } = this;
    const stepX = xSegments * distance;
    const stepY = ySegments * distance;
    this.parametricGeometryFunc = function(u, v, vector) {
      vector.x = (u - 0.5) * stepX;
      vector.y = (v - 0.5) * stepY;
      vector.z = 0;
    };
  }

  createParticles() {
    this.particles = [];

    for (let v = 0; v <= this.ySegments; v++) {
      for (let u = 0; u <= this.xSegments; u++) {
        const position = new Vector3(0, 0, 0);
        this.parametricGeometryFunc(
          u / this.xSegments,
          v / this.ySegments,
          position
        );
        const particle = new Particle(position);
        particle.setMass(this.mass);
        particle.setPinned(u === this.xSegments);
        this.particles.push(particle);
      }
    }
  }

  createConstraints() {
    this.constraints = [];

    const at = (u, v) => this.particles[u + v * (this.xSegments + 1)];

    let u;
    let v;

    for (v = 0; v < this.ySegments; v++) {
      for (u = 0; u < this.xSegments; u++) {
        this.constraints.push([at(u, v), at(u, v + 1), this.distance]);
        this.constraints.push([at(u, v), at(u + 1, v), this.distance]);
      }
    }

    for (u = this.xSegments, v = 0; v < this.ySegments; v++) {
      this.constraints.push([at(u, v), at(u, v + 1), this.distance]);
    }

    for (v = this.ySegments, u = 0; u < this.xSegments; u++) {
      this.constraints.push([at(u, v), at(u + 1, v), this.distance]);
    }
  }

  toGeometryArgs() {
    return [this.parametricGeometryFunc, this.xSegments, this.ySegments];
  }

  getWidth() {
    return this.xSegments * this.distance;
  }

  getHeight() {
    return this.ySegments * this.distance;
  }

  updateWindForce(delta) {
    const time = Date.now();
    this.windStrength = Math.cos(time / 700000) * 500 + 1600;
    this.windForce.set(
      Math.sin(time / 2000),
      Math.cos(time / 3000),
      Math.sin(time / 1000)
    );
    this.windForce.normalize().multiplyScalar(this.windStrength);
  }

  applyAerodynamics(delta, geometry) {
    if (this.windEnabled) {
      geometry.faces.forEach((face) => {
        this.tmpForce
          .copy(face.normal)
          .normalize()
          .multiplyScalar(face.normal.dot(this.windForce));

        this.particles[face.a].addForce(this.tmpForce);
        this.particles[face.b].addForce(this.tmpForce);
        this.particles[face.c].addForce(this.tmpForce);
      });
    }

    this.particles.forEach((particle) => {
      particle.addForce(this.gravityForce);
      particle.integrate(delta);
    });
  }

  fixPinned() {
    this.particles.forEach((p) => {
      if (p.pinned) {
        p.position.copy(p.original);
        p.previous.copy(p.original);
      }
    });
  }

  satisfyConstraints() {
    this.constraints.forEach(([p1, p2, distance]) => {
      this.diff.subVectors(p2.position, p1.position);

      const currentDist = this.diff.length();
      if (currentDist === 0) return;

      const correction = this.diff.multiplyScalar(1 - distance / currentDist);
      const correctionHalf = correction.multiplyScalar(0.5);

      p1.position.add(correctionHalf);
      p2.position.sub(correctionHalf);
    });
  }

  update(delta, geometry) {
    this.updateWindForce(delta);
    this.applyAerodynamics(delta, geometry);
    this.satisfyConstraints();
    this.fixPinned();
  }
}

export default Cloth;
