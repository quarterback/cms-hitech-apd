module.exports = {
  apdActivityStatePersonnel: {
    tableName: 'activity_state_peronnel',

    activity() {
      return this.belongsTo('apdActivity');
    },

    years() {
      return this.hasMany('apdActivityStatePersonnelCost', 'personnel_id');
    },

    toJSON() {
      return {
        id: this.get('id'),
        title: this.get('title'),
        description: this.get('description'),
        years: this.related('years')
      };
    },

    static: {
      updateableFields: ['title', 'description'],
      owns: { years: 'apdActivityStatePersonnelCost' },
      foreignKey: 'personnel_id'
    }
  },

  apdActivityStatePersonnelCost: {
    tableName: 'activity_state_personnel_yearly',

    personnel() {
      return this.belongsTo('apdActivityStatePersonnel', 'personnel_id');
    },

    async validate() {
      if (this.attributes.fte < 0 || this.attributes.fte > 1) {
        throw new Error('fte-out-of-range');
      }
      if (this.attributes.year < 2010 || this.attributes.year > 3000) {
        throw new Error('year-out-of-range');
      }
    },

    toJSON() {
      return {
        id: this.get('id'),
        cost: this.get('cost'),
        fte: this.get('fte'),
        year: this.get('year')
      };
    },

    static: {
      updateableFields: ['year', 'cost', 'fte']
    }
  }
};
