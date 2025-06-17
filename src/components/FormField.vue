  <template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>

    <select
      v-if="type === 'select'"
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :required="required"
    >
      <option value="" disabled selected hidden>-- Choisir --</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <textarea
      v-else-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
    ></textarea>

    <input
      v-else
      :type="type"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :required="required"
    />

    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
    <small v-if="hint" class="form-text text-muted">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string;
  label: string;
}

interface Props {
  modelValue: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  id: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  rows?: number;
  options?: Option[];
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  rows: 3,
  options: () => []
});

defineEmits(['update:modelValue']);
</script>

  
  
  
  
  <!--
  <template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      v-if="type !== 'textarea'"
      :type="type"
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :required="required"
    >
    <textarea
      v-else
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
    ></textarea>
    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
    <small v-if="hint" class="form-text text-muted">{{ hint }}</small>
  </div>
</template>

<script setup lang="ts">

interface Props {
  modelValue: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  id: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  rows?: number;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  rows: 3
});

defineEmits(['update:modelValue']);
</script> -->

